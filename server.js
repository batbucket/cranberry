var express = require('express');
var app = express(); // Function handler supplied to HTTP server 
var http = require('http').Server(app);
var io = require('socket.io')(http);

const TIME_BETWEEN_SYNC_INTERVALS = 5000;

// Called when hitting website home, allows files to be used
app.use(express.static(__dirname));

var currentLoop;

io.on('connection', function(socket) {
    console.log('a user connected');
    socket.on('chat message', function(msg) { // func defined in .html
        io.emit('chat message', msg);
        
        console.log("message " + msg);
        var possibleID = getVideoID(msg);
        console.log("parsed " + possibleID);
        if (possibleID) {
            currentVideoID = possibleID;
            syncVideo(possibleID, io);
        }
    });
    
    socket.on('disconnect', function() { // implicit handler
        console.log('a user disconnected');
    });
});

// Server listens to port 3000
http.listen(3000, function() {
    console.log('listening on *:3000');
});

function syncVideo(videoId, io) {
    if (currentLoop != null) {
        clearInterval(currentLoop);
        currentLoop = null;
    }
    var currentTime = 0;
    currentLoop = setInterval(
        function() {
            if (currentTime)
            io.emit('set video', { videoId: videoId, time: (currentTime / 1000) });
            currentTime += TIME_BETWEEN_SYNC_INTERVALS;
        },
        TIME_BETWEEN_SYNC_INTERVALS
    );
}

function getVideoID(url){
    var regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    var match = url.match(regExp);
    if (match && match[2].length == 11) {
      return match[2];
    } else {
      return null;
    }
}