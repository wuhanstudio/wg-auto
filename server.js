// Web Server
var express = require('express')
var app = express()
var router = express.Router()

const axios = require('axios')

let ip = "127.0.0.1"
let ui_port = 51822
let udp_port = 51821

let container_id = ""

// Static Website
app.use(express.static('resources'))

var http = require('http').createServer(app)
var io = require('socket.io')(http)

// Docker Container
const { Docker } = require('node-docker-api')
const docker = new Docker({ socketPath: '/var/run/docker.sock' })

// Set up directories
global.__basedir = __dirname
const path = require('path')
current_path = process.cwd()

const portfinder = require('portfinder');

io.on('connection', async (socket) => {
    // New client connected
    const sessionID = socket.id
    console.log('[client][connection]', sessionID)
    await axios
        .get('https://ifconfig.co/ip')
        .then(res => {
            ip = res.data.replace(/(\r\n|\n|\r)/gm, "");//remove those line breaks
        })
        .catch(error => {
            console.error(error)
        })

        io.emit('ip', ip, ui_port, udp_port)
    // User requests new port
    socket.on('refresh', async () => {
	console.log('User requested NEW PORT')
        portfinder.basePort = udp_port+1    // default: 8000
	console.log('Baseport:', portfinder.basePort)
        await new_ip()
        io.emit('ip', ip, ui_port, udp_port)
    })

    // Client disconnected
    socket.on('disconnect', () => {

    })
})

// Create a Server
var server = http.listen(8181, () => {

    var host = server.address().address
    var port = server.address().port

    console.log("App listening at http://%s:%s", host, port)
})

async function new_ip() {
    portfinder.getPortPromise()
    .then((tcp) => {
	console.log("New TCP:", tcp)
        ui_port = tcp
    })
    .catch((err) => {
        console.log(err)
    });

    portfinder.getPortPromise()
        .then((udp) => {
	console.log("New UDP:", udp)
            udp_port = udp
        })
        .catch((err) => {
            console.log(err)
        });
    
    await axios
        .get('https://ifconfig.co/ip')
        .then(res => {
            ip = res.data.replace(/(\r\n|\n|\r)/gm, "");//remove those line breaks
	    console.log('Server IP', ip)
        })
        .catch(error => {
            console.error(error)
        })


    if(container_id !== "")
	{
docker.container.list({all:true})
            .then((containers) => {
                containers.forEach(container => {
                    if(container.data.Id == container_id) {
                            // Delete container
			    console.log("Removing previous container", container_id)
                            container.delete({ force: true })
                    }
                })
            })
            .catch(error => console.log(error))

	}

    // Start Docker container
    docker.container.create({
        Image: 'weejewel/wg-easy',
        "Env": [
            "WG_HOST=" + ip,
	    "WG_PORT=" + udp_port.toString(),
            "PASSWORD=wireguard"
        ],
        HostConfig: {
        "Sysctls": {
            "net.ipv4.ip_forward": "1",
            "net.ipv4.conf.all.src_valid_mark": "1"
        },
        "CapAdd": ["NET_ADMIN", "SYS_MODULE"],
        "PortBindings": {
                "51820/udp": [ // port inside of docker container 
		    {
			"HostIp": "0.0.0.0",
                    	"HostPort": udp_port.toString()
		    } // port on host machine
                ],
                "51821/tcp": [ // port inside of docker container 
                    {
			    "HostIp": "0.0.0.0",
			    "HostPort": ui_port.toString()
		    } // port on host machine
                ]
            }
        },
        "ExposedPorts": {
            "51820/udp": {}, 
            "51821/tcp": {} 
        }
    })
    .then( (container) => {
        // Start container
        container_id = container.data.Id 
	console.log('Container Started:', container_id)
        console.log('Initialized with:', ip, ui_port, 'UDP:', udp_port)
        return container.start()
    })
}

const cleanUpServer = async () => {
await docker.container.list({all:true})
            .then((containers) => {
                containers.forEach(container => {
                    if(container.data.Id == container_id) {
                            // Delete container
                            container.delete({ force: true })
                    }
                })
            })
            .catch(error => console.log(error))
console.log('Goodbye!');
	process.exit(0);
}

process.on('exit', function () {
    // Do some cleanup such as close db
    console.log('\nGoogbye!\n')
});

new_ip()
