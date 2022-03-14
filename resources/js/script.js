var socket = io();

function refresh() {
    socket.emit('refresh');
    $('#refresh').addClass('fa-spin');
}

// User connected
socket.on('connect', () => {
    console.log('Session Id: ', socket.id);
});

socket.on('ip', (ip, ui_port, udp_port) => {
	console.log("New IP:", ip, ":", ui_port)
	console.log("UDP Port:", udp_port)
    $('#ip').text(ip + ' : ' + udp_port);
    Snackbar.show({
        text: 'Received the latest IP address',
        pos: 'bottom-right',
        duration: 10000
    });
    $('#ui').attr("href", "http://" + window.location.hostname + ":" + ui_port)
    $('#refresh').removeClass('fa-spin');
});

socket.on('info', (info) => {
    console.log(info);
});

// User disconnected
socket.on('disconnect', () => {

});
