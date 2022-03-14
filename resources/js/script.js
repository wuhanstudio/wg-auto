var socket = io();

// Request a new UDP port
function refresh() {
    socket.emit('refresh');
    $('#refresh').addClass('fa-spin');
}

// User connected
socket.on('connect', () => {
    console.log('Session Id: ', socket.id);
});

// If new IP Port received
socket.on('ip', (ip, ui_port, udp_port) => {
	console.log("New IP:", ip, ":", ui_port)
	console.log("UDP Port:", udp_port)

    // Update Wireguard UDP port
    $('#ip').text(ip + ' : ' + udp_port);
    Snackbar.show({
        text: 'Received the latest IP address',
        pos: 'bottom-right',
        duration: 10000
    });

    // Update the admin page
    $('#ui').attr("href", "http://" + window.location.hostname + ":" + ui_port)

    // Stop the refresh spinner
    $('#refresh').removeClass('fa-spin');
});

// Log debug info
socket.on('info', (info) => {
    console.log(info);
});

// User disconnected
socket.on('disconnect', () => {

});
