// ===========================================

// Web Server
var express = require('express')
var app = express()
var port = process.env.PORT || 3000;

const axios = require('axios')

let ip = "127.0.0.1"
let ui_port = 51822
let udp_port = 51821

// Set password from environment variable WG_PASSWORD
var password = process.env.WG_PASSWORD || "password"

let container_id = ""

// Static Website
app.use(express.static('resources'))

var http = require('http').createServer(app)
var io = require('socket.io')(http)

// Docker Container
const { Docker } = require('node-docker-api')
const docker = new Docker({ socketPath: '/var/run/docker.sock' })

const portfinder = require('portfinder');

// ===========================================

io.on('connection', async (socket) => {
    // New client connected
    const sessionID = socket.id
    console.log('[client][connection]', sessionID)

    // Get server public IP address
    await axios
        .get('https://ifconfig.co/ip')
        .then(res => {
            ip = res.data.replace(/(\r\n|\n|\r)/gm, "");//remove those line breaks
        })
        .catch(error => {
            console.error(error)
        })

    // Notify client of the new IP address and port
    io.emit('ip', ip, ui_port, udp_port)

    // If user requests new port
    socket.on('refresh', async () => {
        console.log('User requested NEW PORT')
        
        portfinder.basePort = udp_port + 1
        console.log('Baseport:', portfinder.basePort)
        
        // Create a new UDP port
        await new_udp()
        
        // Notify client of the new IP address and port
        io.emit('ip', ip, ui_port, udp_port)
    })

    // Client disconnected
    socket.on('disconnect', () => {

    })
})

// Create a Server
var server = http.listen(port, () => {

    var host = server.address().address
    var port = server.address().port

    console.log("App listening at http://%s:%s", host, port)
})

// Create a new UDP port
async function new_udp() {
    // Get a new TCP port
    portfinder.getPortPromise()
        .then((tcp) => {
            console.log("New TCP:", tcp)
            ui_port = tcp
        })
        .catch((err) => {
            console.log(err)
        });

    // Get a new UDP port
    portfinder.getPortPromise()
        .then((udp) => {
            console.log("New UDP:", udp)
            udp_port = udp
        })
        .catch((err) => {
            console.log(err)
        });

    // Get server public IP address
    await axios
        .get('https://ifconfig.co/ip')
        .then(res => {
            ip = res.data.replace(/(\r\n|\n|\r)/gm, "");//remove those line breaks
            console.log('Server IP', ip)
        })
        .catch(error => {
            console.error(error)
        })

    // Remove previous Wireguard container
    if (container_id !== "") {
        docker.container.list({ all: true })
            .then((containers) => {
                containers.forEach(container => {
                    if (container.data.Id == container_id) {
                        // Delete container
                        console.log("Removing previous container", container_id)
                        container.delete({ force: true })
                    }
                })
            })
            .catch(error => console.log(error))
    }

    // Start the new Docker container
    docker.container.create({
        Image: 'weejewel/wg-easy',
        "Env": [
            "WG_HOST=" + ip,
            "WG_PORT=" + udp_port.toString(),
            "PASSWORD=" + password
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
        .then((container) => {
            // Start container
            container_id = container.data.Id
            console.log('Container Started:', container_id)
            console.log('Initialized with:', ip, ui_port, 'UDP:', udp_port)
            return container.start()
        })
}

new_udp()
