$(document).ready(function () {

    var socket = io();

    socket.on('new log', function (subscriberNumber, type, timestamp) {
        var logNotes = '';
        console.log(type);

        if (type == 'send') logNotes = "New SMS sent to";
        else logNotes = "New SMS received from";

        addLog(subscriberNumber, logNotes, timestamp.toString());
    });

    initialize();

});

function initialize() {
    $.get('/api/logs', function (data) {
        console.log(data);
        var logs = JSON.parse(data).logs;
        for (var i = 0; i < logs.length; i++) {
            var l = "<div class='log-entry'><h4>" + logs[i].message + "</h4><p class='log-time-stamp'>" + logs[i].timestamp + "</p></div>";
            $('#log-body').append(l);
            console.log("new log added");
        }
    });
}

function addLog(subscriberNumber, logNotes, timestamp) {
    var log = "<div class='log-entry'><h4>" + logNotes + ": " + subscriberNumber + "</h4>" +
        "<p class='log-time-stamp'>" + timestamp + "</p></div>";
    $('#log-body').append(log);
    console.log("new log from " + subscriberNumber + " added");
}