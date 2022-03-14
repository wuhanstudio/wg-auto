
var my_res = {};
my_res.ulysses16 = {}
my_res.att48 = {}
my_res.st70 = {}
my_res.a280 = {}
my_res.pcb442 = {}
my_res.dsj1000 = {}

my_res.ulysses16.fitness = -1;
my_res.att48.fitness = -1;
my_res.st70.fitness = -1;
my_res.a280.fitness = -1;
my_res.pcb442.fitness = -1;
my_res.dsj1000.fitness = -1;

var socket = io();

// User connected
socket.on('connect', () => {
    $("#status").removeClass('badge-secondary');
    $("#status").addClass('badge-primary');
    window.id = socket.id
    console.log('Session Id: ', socket.id);
});

// User disconnected
socket.on('disconnect', () => {
    $("#status").removeClass('badge-primary');
    $("#status").addClass('badge-secondary');
    $("#status").text('offline');
});

// Update online users
socket.on('users_count', (clients) => {
    $("#status").text(clients + ' online');
});

// Server running algorithms
socket.on('start', () => {
    console.log('Running');
    Snackbar.show({
        text: 'Running, please wait for your result.',
        pos: 'bottom-right',
        duration: 10000
    });
});

// Update Leaderboard Table
socket.on('leaderboard', (obj) => {
    // console.log(obj);
    $(".leaderboard-table").find("tr:not(:first):not(:last)").remove();
    if(obj.ulysses16.length != 0) {
        obj.ulysses16.forEach(element => {
            $('#ulysses16-last').before('<tr id=""><td>' + element.name + '</td><td>' + element.fitness.toFixed(2) + '</td><td>' + element.desc + '</td><td><a href="/leaderboard?id=' + element.id + '&tsp=0&type=txt" target="_blank"><span class="badge badge-primary link">txt</span></a> &nbsp;&nbsp; <a href="/leaderboard?id=' + element.id + '&tsp=0&type=json" target="_blank"><span class="badge badge-success link">json</span></a></td></tr>')
        });
        $('#ulysses16_best').text(obj.ulysses16[0].fitness.toFixed(2));
    }
    if(obj.att48.length != 0 ) {
        obj.att48.forEach(element => {
            $('#att48-last').before('<tr id=""><td>' + element.name + '</td><td>' + element.fitness.toFixed(2) + '</td><td>' + element.desc + '</td><td><a href="/leaderboard?id=' + element.id + '&tsp=1&type=txt" target="_blank"><span class="badge badge-primary link">txt</span></a> &nbsp;&nbsp; <a href="/leaderboard?id=' + element.id + '&tsp=1&type=json" target="_blank"><span class="badge badge-success link">json</span></a></td></tr>')
        });
        $('#att48_best').text(obj.att48[0].fitness.toFixed(2));
    }

    if (obj.st70.length != 0) {
        obj.st70.forEach(element => {
            $('#st70-last').before('<tr id=""><td>' + element.name + '</td><td>' + element.fitness.toFixed(2) + '</td><td>' + element.desc  + '</td><td><a href="/leaderboard?id=' + element.id + '&tsp=2&type=txt" target="_blank"><span class="badge badge-primary link">txt</span></a> &nbsp;&nbsp; <a href="/leaderboard?id=' + element.id + '&tsp=2&type=json" target="_blank"><span class="badge badge-success link">json</span></a></td></tr>')
        });
        $('#st70_best').text(obj.st70[0].fitness.toFixed(2));
    }

    if (obj.a280.length != 0) {
        obj.a280.forEach(element => {
            $('#a280-last').before('<tr id=""><td>' + element.name + '</td><td>' + element.fitness.toFixed(2) + '</td><td>' + element.desc + '</td><td><a href="/leaderboard?id=' + element.id + '&tsp=30&type=txt" target="_blank"><span class="badge badge-primary link">txt</span></a> &nbsp;&nbsp; <a href="/leaderboard?id=' + element.id + '&tsp=3&type=json" target="_blank"><span class="badge badge-success link">json</span></a></td></tr>')
        });
        $('#a280_best').text(obj.a280[0].fitness.toFixed(2));
    }

    if(obj.pcb442.length != 0) {
        obj.pcb442.forEach(element => {
            $('#pcb442-last').before('<tr id=""><td>' + element.name + '</td><td>' + element.fitness.toFixed(2) + '</td><td>' + element.desc + '</td><td><a href="/leaderboard?id=' + element.id + '&tsp=4&type=txt" target="_blank"><span class="badge badge-primary link">txt</span></a> &nbsp;&nbsp; <a href="/leaderboard?id=' + element.id + '&tsp=4&type=json" target="_blank"><span class="badge badge-success link">json</span></a></td></tr>')
        });
        $('#pcb442_best').text(obj.pcb442[0].fitness.toFixed(2));
    }

    if(obj.dsj1000.length != 0) {
        obj.dsj1000.forEach(element => {
            $('#dsj1000-last').before('<tr id=""><td>' + element.name + '</td><td>' + element.fitness.toFixed(2) + '</td><td>' + element.desc + '</td><td><a href="/leaderboard?id=' + element.id + '&tsp=5&type=txt" target="_blank"><span class="badge badge-primary link">txt</span></a> &nbsp;&nbsp; <a href="/leaderboard?id=' + element.id + '&tsp=5&type=json" target="_blank"><span class="badge badge-success link">json</span></a></td></tr>')
        });
        $('#dsj1000_best').text(obj.dsj1000[0].fitness.toFixed(2));
    }

});

// Log info in console
socket.on('info', (msg) => {
    // var msg = msg.replace(/\x1b[[0-9;]*[a-zA-Z]/g, '');
    msg = msg.replace(/[^\x20-\x7E]/g, '')
    if(msg[1] == '[') {
        msg = msg.substring(1);
    }
    console.log(msg);
});

// Log error in console
socket.on('error', (msg) => {
    console.log(msg);
    Snackbar.show({
        text: 'Error: ' + msg,
        pos: 'bottom-right',
        duration: 8000,
        backgroundColor: '#E64A19',
        showAction: false
    });
});

function update_your_res(tsp_file, fitness) {

    // Stop blinking
    $("#" + tsp_file + "_your").removeClass('blink_me');

    if(fitness > 0) {
        $("#" + tsp_file + "_your").text(fitness.toFixed(2));
        $("#" + tsp_file + "_download").show();
        $("#" + tsp_file + "_download a:nth-child(1)").attr("href", "/api/files/result/?id="+ window.id + "&filename=" + tsp_file + ".txt");
        $("#" + tsp_file + "_download a:nth-child(2)").attr("href", "/api/files/result/?id="+ window.id + "&filename=" + tsp_file + ".json");
        enable_btn($("#" + tsp_file + "_submit"))
    }
    else if (fitness == -1)
    {
        $("#" + tsp_file + "_your").text("No Answer");
    }
    else if (fitness == -2)
    {
        $("#" + tsp_file + "_your").text("Wrong Answer");
    }
    else if (fitness == -3)
    {
        $("#" + tsp_file + "_your").text("Timeout");
    }
    else {
        console.log(tsp_file + ": " + fitness)
        $("#" + tsp_file + "_your").text("Unknown");
    }
}

// Update personal result
socket.on('result', (res) => {

    res = JSON.parse(res);

    $("#ulysses16_your").text('-');
    $("#att48_your").text('-');
    $("#st70_your").text('-');
    $("#a280_your").text('-');
    $("#pcb442_your").text('-');
    $("#dsj1000_your").text('-');

    $("#ulysses16_your").removeClass('blink_me');
    $("#att48_your").removeClass('blink_me');
    $("#st70_your").removeClass('blink_me');
    $("#a280_your").removeClass('blink_me');
    $("#pcb442_your").removeClass('blink_me');
    $("#dsj1000_your").removeClass('blink_me');

    if (res.length !== 0) {

        $("#resultModal").modal('show');
        $('#submission_info').show();

        res.forEach(e => {
            if(e.name === "ulysses16.txt") {
                my_res.ulysses16.fitness = e.fitness
                my_res.ulysses16.solution = e.solution
                update_your_res("ulysses16", e.fitness)
            }
            if(e.name === "att48.txt") {
                my_res.att48.fitness = e.fitness
                my_res.att48.solution = e.solution
                update_your_res("att48", e.fitness)
            }
            if(e.name === "st70.txt") {
                my_res.st70.fitness = e.fitness
                my_res.st70.solution = e.solution
                update_your_res("st70", e.fitness)
            }
            if(e.name === "a280.txt") {
                my_res.a280.fitness = e.fitness
                my_res.a280.solution = e.solution
                update_your_res("a280", e.fitness)
            }
            if(e.name === "pcb442.txt") {
                my_res.pcb442.fitness = e.fitness
                my_res.pcb442.solution = e.solution
                update_your_res("pcb442", e.fitness)
            }
            if(e.name === "dsj1000.txt") {
                my_res.dsj1000.fitness = e.fitness
                my_res.dsj1000.solution = e.solution
                update_your_res("dsj1000", e.fitness)
            }
        });
    }
});
