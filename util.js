/**
 * Allows this file to be used serverside as well as clientside.
 * https://stackoverflow.com/questions/3225251/how-can-i-share-code-between-node-js-and-the-browser
 */
(function(exports) {
    // Add string format function if nonexistent
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
    
    // Add trim if nonexistent
    if (!('trim' in String.prototype)) {
        String.prototype.trim= function() {
            return this.replace(/^\s+/, '').replace(/\s+$/, '');
        };
    }
    
    // Reads a message, and passes the param only to be handled by action
    exports.parseCommand = function(command, message) {
        var text = message.text;
        if (text.toLowerCase().startsWith(command.text.toLowerCase() + " ")) {
            var param = text.substring(command.text.length + 1);
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
    
    // Regex obtains youtube video ID
    exports.getVideoID = function(url){
        var regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        var match = url.match(regExp);
        if (match && match[2].length == 11) {
            return match[2];
        } else {
            return null;
        }
    }
    
    // Get everyone connected
    exports.getListOfSockets = function(io) {
        let sockets = [];
        try {
            let socketObj = io.sockets.sockets;
            for (let id of Object.keys(socketObj)) {
                sockets.push(io.sockets.connected[id]);
            }
        } catch(e) {

        }
        return sockets;
    }
    
// Part of allowing serverside and clientside use
}(typeof exports === 'undefined'? this.util = {} : exports));