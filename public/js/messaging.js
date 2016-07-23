$(document).ready(function(){
    getSubscribers();
    getLocations();

    $('#send-msg').on('click', function(){
        addMessage(true, $('#compose-text').val(), new Date().toDateString());
        sendMessage($('#thread-title h4').html(),$('#compose-text').val());
        $('#compose-text').val('');
    });

    $('new-message-modal').on('shown.bs.modal', function (){
    });

});

var subscribers = [];

function getSubscribers() {
    $.get('/subscribers', function(data) {
        subscribers = $.parseJSON(data).users;
        if(!subscriber) return;
        for(var i=0; i<subscribers.length; i++) {
            var subscriber = "<li class='contact list-group-item' onclick='selectContact(this)'>" +
                subscribers[i].subscriber_number +
                "<span class='badge'>0</span></li>";
            $('#contact-list').append(subscriber);
        }
    });
}

function getLocations() {
    $.get('/locations-all', function(data) {
        var locations = $.parseJSON(data).locations;

        for(var i=0; i<locations.length; i++) {
            var location = "<div class='location col-md-3'><div class='location-card'>" +
                "<input type='checkbox'/>&nbsp; " + locations[i].name + "</div></div>";
            $('#location-list').append(location);
        }

    });
}

function addMessage(status, content, timestamp) {
    var tag = "<div class='col-md-12 message-wrapper'>";
    if (status) tag += "<div class='message message-admin'>"
    else tag += "<div class='message message-client'>";
    tag += content + "<p class='message-time'>" +
        timestamp + "</p></div></div>"
    $('#thread-body').append(tag);
}

function selectContact(element) {
    deselectContacts(element);

    var index = $(element).prevAll().length;
    $('#thread-title h4').html(subscribers[index].subscriber_number);

    var msg_url = '/subscriber-messages?subscriber_id=' + subscribers[index].id;
    $.get(msg_url, function (data){
        var messages = $.parseJSON(data).messages;
        for(var i=0; i<messages.length; i++) {
//            console.log(data);
            addMessage(false, messages[i].content, new Date(messages[i].timestamp).toDateString());
        }
    });

    var loc_url = '/location?id=' + subscribers[index].currentlocation_id;
//    var loc_url = '/location?id=' + subscribers[index].baselocation_id;

    $.get(loc_url, function (data) {
        console.log(data);
        var location = $.parseJSON(data).location;
        var latitude = location.latitude;
        var longitude = location.longitude;

        var string_loc_url = "http://maps.googleapis.com/maps/api/geocode/json?latlng=" +
            latitude + "," + longitude + "&sensor=true";

        $.get(string_loc_url, function (string_location){
            $('#thread-title p').html(string_location.results[0].formatted_address);
        });

    });
}

function deselectContacts(element) {
    $('#thread-body').html('');
    $('#contact-list li').each(function(){
        $(this).removeClass('active-contact');
    });
    $(element).addClass('active-contact');
}

function sendMessage(number, message) {
    var url = '/send-message?subscriber_number='+number+'&message='+message;
    $.get(url, function () {
        console.log('sms sent to '+ number + 'with msg: ' + message);
    });
}


