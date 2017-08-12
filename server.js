const START_VIDEO_PAD_SECONDS = -3000;
const MILLISECONDS_TO_SECONDS = 1000;
const SECONDS_PER_UPDATE = 1000;
const SET_USERNAME = "/user";
const SET_VIDEO = "/play";
const SET_COLOR = "/color";
const MAX_USERNAME_LENGTH = 10;
const MIN_USERNAME_LENGTH = 3;

var util = require("./util.js");
var express = require('express');
var app = express(); // Function handler supplied to HTTP server 
var http = require('http').Server(app);
var io = require('socket.io')(http);

var currentVideoTime = 0;
var currentVideoID;
var connections = 0;
var currentLoop;

const CHAT_COMMANDS = [
    { 
        text: SET_USERNAME,
        action: function(param, sender) {
            var userName = param;
            var socket = sender;
            if (userName 
                && !userName.includes(" ") 
                && userName.length >= MIN_USERNAME_LENGTH
                && userName.length <= MAX_USERNAME_LENGTH
                && isUsernameUnique(userName)) {
                var oldUserName = socket.userName;
                socket.userName = userName;
                io.emit("system message", "{0} became {1}.".format(oldUserName, userName));
                io.to(sender.id).emit("update username", socket.userName, socket.color);
            }
        }
    },
    {   
        text: SET_VIDEO,
        action: function(param, sender) {
            var possibleID = util.getVideoID(param);
            if (possibleID) {
                startVideo(possibleID);
                io.emit("system message", "{0} added {1}.".format(sender.userName, possibleID));
            }
        }
    },
    {
        text: SET_COLOR,
        action: function(param, sender) {
            sender.color = param;
            io.to(sender.id).emit("system message", "Changed username color to {0}.".format(sender.color));
            io.to(sender.id).emit("update username", sender.userName, sender.color);
        }
    },
];

// Called when hitting website home, allows files to be used
app.use(express.static(__dirname));

io.on('connection', function(socket) {
    connections++;
    emitPopulationUpdate();
    
    giveNewUserRandomNameAndColor(socket);
    
    io.emit("system message", "{0} connected.".format(socket.userName));
    
    socket.on('chat message', function(msg) { // func defined in .html
        
        // Check if message has any server side commands
        for (var i = 0; i < CHAT_COMMANDS.length; i++) {
            if (util.parseCommand(CHAT_COMMANDS[i], { text: msg, sender: socket })) {
                return;
            }
        }
        
        // No whitespace only messages, also gets rid of multiple spaces between chars
        if (msg.trim() !== "") {
            emitChatMessage(msg, socket);
        }
    });
    
    socket.on('disconnect', function() { // implicit handler
        io.emit("system message", "{0} disconnected.".format(socket.userName));
        connections--;
        emitPopulationUpdate();
    });
    
    socket.on("request update", function() {
        io.to(socket.id).emit('set video', 
           { 
            videoId: currentVideoID, 
            time: (currentVideoTime / MILLISECONDS_TO_SECONDS) 
            }
      );
    });
});

// Server listens to port 3000
http.listen(process.env.PORT || 3000, function() {

});

function giveNewUserRandomNameAndColor(socket) {
    socket.userName = socket.id.substring(0, 6);
    socket.color = util.getRandomColor();
    io.to(socket.id).emit("update username", socket.userName, socket.color);
}

// Update counter on every client's page
function emitPopulationUpdate() {
    io.emit("update population", connections);
}

function emitChatMessage(message, sender) {
    var chatMessage = {
        message: message,
        author: sender.userName,
        color: sender.color
    };
    io.emit('chat message', chatMessage);
}

// Run server-side timer that clients will sync to
function startVideo(videoId) {
    currentVideoID = videoId;
    currentVideoTime = START_VIDEO_PAD_SECONDS;
    if (currentLoop != null) {
        clearInterval(currentLoop);
        currentLoop = null;
    }
    currentLoop = setInterval(
        function() {
            currentVideoTime += SECONDS_PER_UPDATE;
        },
        SECONDS_PER_UPDATE
    );
}

// Doesn't matter if cases are different, must be unique
function isUsernameUnique(name) {
    var connectedSockets = util.getListOfSockets(io);
    for (var i = 0; i < connectedSockets.length; i++) {
        var connectedSocket = connectedSockets[i];
        if (connectedSocket.userName.toLowerCase() === name.toLowerCase()) {
            return false;
        }
    }
    return true;
}