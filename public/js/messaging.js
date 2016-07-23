$(document).ready(function(){
    getSubscriber();

    $('#send-msg').on('click', function(){
        addMessage(true, $('#compose-text').val(), new Date().toDateString());
    });

});

var contacts = [];

function getSubscriber() {
    $.get('/subscribers', function(data) {
        contacts = $.parseJSON(data).users;

        for(var i=0; i<contacts.length; i++) {
            var tag = "<li class='contact list-group-item' onclick='selectContact(this)'>" +
                contacts[i].subscriber_number +
                "<span class='badge'>0</span></li>";

            $('#contact-list').append(tag);
//            if(i == 0) selectContact(tag);
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
    $('#thread-title h4').html(contacts[index].subscriber_number);

    var url = '/subscriber-messages?subscriber_id=' + contacts[index].id;
    console.log(url);
    $.get(url, function (data){
        var messages = $.parseJSON(data).messages;

        for(var i=0; i<messages.length; i++) {
            console.log(messages[i]);
            addMessage(false, messages[i].content, new Date(messages[i].timestamp).toDateString());
        }

    });
}

function deselectContacts(element) {
    $('#thread-body').html('');
    $('#contact-list li').each(function(){
        $(this).removeClass('active-contact');
    });
    $(element).addClass('active-contact');
}