$(document).ready(function(){

    var socket = io();

    socket.on('new log', function(subscriberNumber, status, timestamp){
        addLog(subscriberNumber, status, timestamp);
    });

    // socket.emit('new log', );

});

function addLog(subscriberNumber, status, timestamp) {
    var log = "<div>" + subscriberNumber + "</div>";
    $('log-body').append(log);
    console.log("new log from " + subscriberNumber + "added");
}