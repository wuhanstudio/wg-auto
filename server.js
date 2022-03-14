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

    console.log(ip, ui_port, 'UDP:', udp_port)

    io.emit('ip', ip, ui_port, udp_port)

    // User requests new port
    socket.on('refresh', () => {
        console.log('udp port requested', udp_port)
        portfinder.basePort = udp_port+1;    // default: 8000
        new_ip()
    })

    // Client disconnected
    socket.on('disconnect', () => {

    })
})

// Create a Server
var server = http.listen(8080, () => {

    var host = server.address().address
    var port = server.address().port

    console.log("App listening at http://%s:%s", host, port)
})

async function new_ip() {
    portfinder.getPortPromise()
    .then((p) => {
        ui_port = p
    })
    .catch((err) => {
        console.log(err)
    });

    portfinder.getPortPromise()
        .then((p) => {
            udp_port = p
        })
        .catch((err) => {
            console.log(err)
        });
    
    await axios
        .get('https://ifconfig.co/ip')
        .then(res => {
            ip = res.data.replace(/(\r\n|\n|\r)/gm, "");//remove those line breaks
        })
        .catch(error => {
            console.error(error)
        })

    console.log('Initialized with:', ip, ui_port, 'UDP:', udp_port)

    // Start Docker container
    docker.container.create({
        Image: 'weejewel/wg-easy',
        "Env": [
            "WG_HOST=" + ip,
            "PASSWORD=wireguard"
        ],
        "Sysctls": {
            "net.ipv4.ip_forward": "1",
            "net.ipv4.conf.all.src_valid_mark": "1"
        },
        "CapAdd": ["NET_ADMIN", "SYS_MODULE"],
        HostConfig: {
            "PortBindings": {
                "51820/udp": [ // port inside of docker container 
                    {"HostPort": "8000"} // port on host machine
                ],
                "51821/udp": [ // port inside of docker container 
                    {"HostPort": "8001"} // port on host machine
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
        socket.emit('info','Container Id: ' + container_id)
        return container.start()
    })


    io.emit('ip', ip, ui_port, udp_port)
}

new_ip()
