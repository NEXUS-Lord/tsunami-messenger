var express = require('express');
var http = require('http');
var { Server } = require('socket.io');

var app = express();
var server = http.createServer(app);
var io = new Server(server, { cors: { origin: '*' } });

var PORT = process.env.PORT || 3001;
var players = {};

app.get('/', function(req, res) {
    res.json({ status: 'ok', players: Object.keys(players).length });
});

io.on('connection', function(socket) {
    var currentId = null;

    socket.on('player:move', function(data) {
        if (!data || !data.id) return;
        currentId = data.id;
        players[data.id] = {
            id: data.id,
            x: data.x || 0,
            y: data.y || 0,
            z: data.z || 0,
            rotation: data.rotation || 0,
            lastSeen: Date.now()
        };
        var playerList = [];
        var ids = Object.keys(players);
        for (var i = 0; i < ids.length; i++) {
            playerList.push(players[ids[i]]);
        }
        socket.broadcast.emit('players:update', playerList);
    });

    socket.on('disconnect', function() {
        if (currentId && players[currentId]) {
            delete players[currentId];
        }
    });
});

// Clean stale players every 5 seconds
setInterval(function() {
    var now = Date.now();
    var ids = Object.keys(players);
    for (var i = 0; i < ids.length; i++) {
        if (now - players[ids[i]].lastSeen > 10000) {
            delete players[ids[i]];
        }
    }
}, 5000);

server.listen(PORT, function() {
    console.log('Tsunami Messenger server running on port ' + PORT);
});
