$(document).ready(function(){
    getSubscriber();

    $('#send-msg').on('click', function(){
        addMessage(true, $('#compose-text').val());
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

function addMessage(status, content) {
    var tag = "<div class='col-md-12 message-wrapper'>";
        if (status) tag += "<div class='message message-admin'>"
        else tag += "<div class='message message-client'>";
    tag += content + "</div></div>"
    $('#thread-body').append(tag);
}

function selectContact(element) {
    deselectContacts(element);

    var index = $(element).prevAll().length;
    $('#thread-title h4').html(contacts[index].subscriber_number);

    var url = '/subscriber-messages?subscriber_id=' + contacts[index].id;
    console.log(url);
    $.get(url, function (data){
        console.log(data);
    });
}

function deselectContacts(element) {
   $('#contact-list li').each(function(){
       $(this).removeClass('active-contact');
   });

    $(element).addClass('active-contact');
}