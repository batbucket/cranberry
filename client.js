const VIDEO_TIME_SYNC_LEEWAY = 3;

// 2. This code loads the IFrame Player API code asynchronously.
var tag = document.createElement('script');

tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

// 3. This function creates an <iframe> (and YouTube player)
//    after the API code downloads.
var player;
function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
        height: '390',
        width: '640',
        videoId: 'M7lc1UVf-VE',
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });
}

// 4. The API will call this function when the video player is ready.
function onPlayerReady(event) {
    event.target.playVideo();
    isPlayerReady = true;
}

// 5. The API calls this function when the player's state changes.
//    The function indicates that when playing a video (state=1),
//    the player should play for six seconds and then stop.
var done = false;
function onPlayerStateChange(event) {
    if (event.data == YT.PlayerState.PLAYING && !done) {
        setTimeout(stopVideo, 6000);
        done = true;
    }
}

function stopVideo() {
    player.stopVideo();
}

var socket = io();
var isPlayerReady;

$(function() {
    $('form').submit(function(){
        socket.emit('chat message', $('#m').val());
        $('#m').val('');
        return false;
    });

    socket.on('chat message', function(msg) {
        var container = $('#container');
        var shouldScrollDown = 
            (container[0].scrollTop + container[0].clientHeight 
             == container[0].scrollHeight);
        
        var node = document.createElement('div');
        node.className = "message";
        var text = document.createTextNode(msg);
        node.appendChild(text);
        container.append(node);
        
        if (shouldScrollDown) {
            container[0].scrollTop = container[0].scrollHeight;
        }
    });
    
    socket.on('set video', function(video) {
        if (isPlayerReady) {
            if (player.getVideoData()['video_id'] != video.videoId) {
                player.loadVideoById(video);
            }
            if (Math.abs(video.time - player.getCurrentTime()) > VIDEO_TIME_SYNC_LEEWAY) {
                player.seekTo(video.time, true);
            }
        }
    });
});