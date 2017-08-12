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
    
$(function() {
    queryServerForVideoUpdate(DEFAULT_QUERY_INTERVAL);
    addSystemMessage("Chat commands can be read at https://bitbucket.org/eternitylabs/cranberry")
    
    $('form').submit(function() {
        var message = $('#m').val();
        $('#m').val('');
        
        for (var i = 0; i < CHAT_COMMANDS.length; i++) {
            if (util.parseCommand(CHAT_COMMANDS[i], { text: message, sender: socket })) {
                return false;
            }
        }
        
        socket.emit('chat message', message);
        return false;
    });

    socket.on('chat message', function(msg) {
        addChatMessage(msg);
    });
    
    socket.on('system message', function(msg) {
       addSystemMessage(msg); 
    });
    
    socket.on('set video', function(video) {
        setVideo(video);
    });
});

function setVideo(video) {
    if (isPlayerReady && video.time > 0) {
        if (player.getVideoData()['video_id'] != video.videoId) {
            player.loadVideoById(video);
        }
        var difference = Math.abs(video.time - player.getCurrentTime());
        console.log("diff: " + difference);
        console.log("leewayTime: " + leewayTime);
        if (difference > leewayTime) {
            player.seekTo(video.time, true);
        }
    }
}

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

function addSystemMessage(msg) {
    var system = document.createElement("i");
    system.innerHTML = msg.fontcolor("grey");
    addMessage(system);
}

function addChatMessage(msg) {
    var user = document.createElement("b");
    console.log(msg.color);
    user.innerHTML = msg.author.fontcolor(msg.color);
    var text = document.createTextNode(": " + msg.message);
    addMessage(user, text);
}

function addMessage() {
    var container = $('#container');
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