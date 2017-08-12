const SET_QUERY_INTERVAL = "/query";
const SET_LEEWAY = "/leeway";
const DEFAULT_QUERY_INTERVAL = 2000;

var socket = io();
var loop;
var leewayTime = 3;

const CHAT_COMMANDS = [
    {
        text: SET_QUERY_INTERVAL,
        action: function(param, sender) {
            var ms = parseInt(param);
            if (!isNaN(ms) && ms >= 0) {
                queryServerForVideoUpdate(ms);
                addSystemMessage("Server will now be queried for a video update every {0} ms.".format(ms));
            }
        }
    },
    {
        text: SET_LEEWAY,
        action: function(param, sender) {
            var leeway = parseInt(param);
            if (!isNaN(leeway) && leeway >= 0) {
                leewayTime = leeway;
                addSystemMessage(
                    "Video will now update if time difference with server is greater than {0} seconds."
                    .format(leewayTime));
            }
        }
    }
];

// Called on window load I think??
$(function() {
    queryServerForVideoUpdate(DEFAULT_QUERY_INTERVAL);
    addSystemMessage("Chat commands can be read at bitbucket.org/eternitylabs/cranberry")
    
    makeTextAreaEnterSubmitContent();

    socket.on('chat message', function(msg) {
        addChatMessage(msg);
    });
    
    socket.on('system message', function(msg) {
       addSystemMessage(msg); 
    });
    
    socket.on('update username', function(userName, color) {
        document.getElementById("username").innerHTML = userName.fontcolor(color); 
    });
    
    // number of people currently in the chat
    socket.on("update population", function(count) {
        document.getElementById("count").innerHTML = count;
    });
    
    socket.on('set video', function(video) {
        setVideo(video);
    });
});

function makeTextAreaEnterSubmitContent() {
    $('#m').keypress(function(event) {
    if ((event.keyCode || event.which) == 13) {
        event.preventDefault();
        chat();
        return false;
      }
    });
}

// send a message to server
function chat() {
    var message = $('#m').val();
    $('#m').val('');

    // Check if user is inputting any client-side commands
    for (var i = 0; i < CHAT_COMMANDS.length; i++) {
        if (util.parseCommand(CHAT_COMMANDS[i], { text: message, sender: socket })) {
            return false;
        }
    }

    socket.emit('chat message', message);
    return false;
}

function setVideo(video) {
    if (isPlayerReady && video.time > 0) {
        
        // Update video if not playing correct ID
        if (player.getVideoData()['video_id'] != video.videoId) {
            player.loadVideoById(video);
        }
        
        var timeDifferenceWithServer = Math.abs(video.time - player.getCurrentTime());
        
        // Don't update current time if within a leeway amount
        if (timeDifferenceWithServer > leewayTime) {
            player.seekTo(video.time, true);
        }
    }
}

// Repeatedly ask server for video update
function queryServerForVideoUpdate(intervalTime) {
    if (loop) {
        clearInterval(loop);
    }
    loop = setInterval(
        function() {
            socket.emit("request update");
        },
        intervalTime
    )
}

// System messages don't have a sender
function addSystemMessage(msg) {
    var system = document.createElement("i");
    system.innerHTML = msg.fontcolor("grey");
    addMessage(system);
}

// Chat messages have a sender
function addChatMessage(msg) {
    var user = document.createElement("b");
    user.innerHTML = msg.author.fontcolor(msg.color);
    var text = document.createTextNode(": " + msg.message);
    addMessage(user, text);
}

// Adds message to container and handles autoscrolling
function addMessage() {
    var container = $('#container');
    
    // Only scroll down IF scrollbar is already at bottom
    var shouldScrollDown = 
        (container[0].scrollTop + container[0].clientHeight 
         == container[0].scrollHeight);
    
    var div = document.createElement('div');
    div.className = "message";
    for (var i = 0; i < arguments.length; i++) {
        div.appendChild(arguments[i]);
    }
    container.append(div);
    
    if (shouldScrollDown) {
        container[0].scrollTop = container[0].scrollHeight;
    }
}