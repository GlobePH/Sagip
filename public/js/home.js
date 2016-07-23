$(document).ready(function() {
    initializeMenu();
    initializeMap();
});

var map;
var origin_location;
var markers = [];

var origin_latitude = 14.553406;
var origin_longitude = 121.049923;

//sets up map and fetch markings from database
function initializeMap() {
    var mapContainer = $("#map-container")[0];
    origin_location = new google.maps.LatLng(origin_latitude, origin_longitude);

    var mapProperties = {
        center: origin_location,
        zoom: 13,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    }

    map = new google.maps.Map(mapContainer, mapProperties);
    console.log("new map created on: " + origin_location);

    addMarker(origin_latitude, origin_longitude);
    fetchFromDataSource();
}

function fetchFromDataSource() {
    $.get("/subscribers", function(data){
        var list = $.parseJSON(data).users;
        for(var i=0; i<list.length; i++) {
//            console.log(list[i]);
            var url = "/location?id=" + list[i].id;
            $.get(url, function(subscriber){
                var location = $.parseJSON(subscriber).location;
                addMarker(location.latitude, location.longitude);
            });
        }
    });
}

function addMarker(latitude, longitude) {
    var location = new google.maps.LatLng(latitude, longitude);
    var marker = new google.maps.Marker({
        position : location,
        map : map
    });
    markers.push(marker);
    addEventListenerToMarker(marker);
    console.log("new marker added on: " + location);
}

function setMapOnMarkers(map, list) {
    for(var i=0; i<list.length; i++) {
        list[i].setMap(map);
    }
}

function addEventListenerToMarker(marker) {
    marker.addListener('click', function(){
        var location = marker.position.toJSON();
        getDetails(location.lat, location.lng);
    });
}

function getDetails(dest_latitude, dest_longitude) {
    var url = '/locate?' + "&origins=" + origin_latitude + "," + origin_longitude +
        "&destinations=" + dest_latitude + "," + dest_longitude;

    $.get(url, function(result) {
        var details = result.data.rows[0].elements[0];
        var distance = details.distance.text;
        var duration = details.duration.text;
        var origin = result.data.origin_addresses[0];
        console.log("\nhelp is coming from " + origin + ",\n\t" + distance +
            " away (estimate time of arrival: " + duration + ")");
    });
}

$("#menu-toggle").click(function(e) {
    e.preventDefault();
    $("#wrapper").toggleClass("toggled");
});

$("#menu-toggle-2").click(function(e) {
    e.preventDefault();
    $("#wrapper").toggleClass("toggled-2");
    $('.menu ul').hide();
});

function initializeMenu() {
    $('.menu ul').hide();
    $('.menu ul').children('.current').parent().show();
    $('.menu li a').click(function() {
        var checkElement = $(this).next();
        if((checkElement.is('ul')) && (checkElement.is(':visible'))) {
            return false;
        }
        if((checkElement.is('ul')) && (!checkElement.is(':visible'))) {
            $('.menu ul:visible').slideUp('normal');
            checkElement.slideDown('normal');
            return false;
        }
    });
}