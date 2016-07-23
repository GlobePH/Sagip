$(document).ready(function(){
    getSubscriber();
});

function getSubscriber() {

    $.get('/subscribers', function(data) {
        var users = $.parseJSON(data).users;

        for(var i=0; i<users.length; i++) {
            var tag = "<li class='contact'>"+ users[i].subscriber_number +"</li>"
            $('#contact-list').append(tag);
        }

    });

}