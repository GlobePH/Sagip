$(document).ready(function () {

    var socket = io();

    socket.on('new log', function (subscriberNumber, type, timestamp) {
        var logNotes = '';
        console.log(type);

        if (type == 'send') logNotes = "New SMS sent to";
        else logNotes = "New SMS received from";

        addLog(subscriberNumber, logNotes, timestamp.toString());
    });

});

function addLog(subscriberNumber, logNotes, timestamp) {
    var log = "<div class='log-entry'><h4>" + logNotes + ": " + subscriberNumber + "</h4>" +
        "<p class='log-time-stamp'>" + timestamp + "</p></div>";
    $('#log-body').append(log);
    console.log("new log from " + subscriberNumber + " added");
}