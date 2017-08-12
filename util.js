/**
 * Allows this file to be used serverside as well as clientside.
 * https://stackoverflow.com/questions/3225251/how-can-i-share-code-between-node-js-and-the-browser
 */
(function(exports) {
    if (!String.prototype.format) {
      String.prototype.format = function() {
        var args = arguments;
        return this.replace(/{(\d+)}/g, function(match, number) { 
          return typeof args[number] != 'undefined'
            ? args[number]
            : match
          ;
        });
      };
    }
    
    exports.parseCommand = function(command, message) {
        var text = message.text;
        if (text.toLowerCase().startsWith(command.text.toLowerCase() + " ")) {
            var param = text.substring(command.text.length + 1);
            console.log("parsed: " + param);
            command.action(param, message.sender);
            return true;
        }
        return false;
    }
    
    exports.getRandomColor = function() {
        var letters = '0123456789ABCDEF';
        var color = '#';
        for (var i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }
    
    exports.getVideoID = function(url){
        var regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        var match = url.match(regExp);
        if (match && match[2].length == 11) {
            return match[2];
        } else {
            return null;
        }
    }
    
    exports.getListOfSockets = function(io) {
        let sockets = [];
        try {
            let socketObj = io.sockets.sockets;
            for (let id of Object.keys(socketObj)) {
                sockets.push(io.sockets.connected[id]);
            }
        } catch(e) {
            console.log(`Attempted to access non-existent room: ${room}`);
        }
        return sockets;
    }
}(typeof exports === 'undefined'? this.util = {} : exports));