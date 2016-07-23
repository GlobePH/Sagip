$(document).ready(function () {
    initializeMap();

    var socket = io();

    socket.on('add marker', function (lat, lng, subscriberNumber) {
        addMarker(lat, lng, icons[1], subscriberNumber);
    });

    socket.on('remove marker', function (lat, lng, subscriberNumber) {
        addMarker(lat, lng, icons[1], subscriberNumber);
    });

    socket.on('add message', function (msg) {
        console.log(msg);
    });

    $("#floating-filter").on("click", function () {
        setMapOnMarkers(null, markers);
        var filter = $('input:checked').val();
        console.log(filter);
        fetchFromDataSource(filter);
    });

    $('get-victim-modal').on('shown.bs.modal', function (){});

});

/* MAPS Components */

var map;
var origin_location;
var markers = [];

var origin_latitude = 14.553406;
var origin_longitude = 121.049923;
var icons = ["blue-marker.png","gray-marker.png","green-marker.png","orange-marker.png","red-marker.png","violet-marker.png","yellow-marker.png"];

//sets up map and fetch markings from database
function initializeMap() {
    var mapContainer = $("#map-container")[0];

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            origin_latitude = position.coords.latitude;
            origin_longitude = position.coords.longitude;

            origin_location = new google.maps.LatLng(origin_latitude, origin_longitude);

            var mapProperties = {
                center: origin_location,
                zoom: 13,
                mapTypeId: google.maps.MapTypeId.ROADMAP
            };

            map = new google.maps.Map(mapContainer, mapProperties);
            console.log("new map created on: " + origin_location);

            addMarker(origin_latitude, origin_longitude, icons[5], null);
            map.setCenter(origin_location);
            fetchFromDataSource("");
        });

    } else {
        console.log("Not Located");
    }

}

function fetchFromDataSource(filter) {
    url = "/subscribers?filter=" + filter;
    $.get(url, function (data) {
        var list = $.parseJSON(data).subscribers;

        if(!list) {
            console.log("no data to fetch from source");
            return;
        }

        for (var i = 0; i < list.length; i++) {
            var url = "/locations?id=" + list[i].currentlocation_id;
            $.get(url, function (subscriber) {
                var location = $.parseJSON(subscriber).locations;
                addMarker(location.latitude, location.longitude, icons[1],list[0].subscriber_number);
            });
        }
    });
}

function addMarker(latitude, longitude, icon, subscriberNumber) {
    var location = new google.maps.LatLng(latitude, longitude);
    var marker = new google.maps.Marker({
        position: location,
        map: map,
        icon: '/images/markers/' + icon
    });

    var subscriber = {subscriberNumber : subscriberNumber, marker : marker};
    markers.push(subscriber);
    addEventListenerToMarker(subscriber);
    map.panTo(location);
    console.log("new marker added on: " + location);
}

function setMapOnMarkers(map, list) {
    for (var i = 0; i < list.length; i++) {
        list[i].setMap(map);
    }
}

function addEventListenerToMarker(subscriber) {
    var marker = subscriber.marker;
    marker.addListener('click', function () {
        var location = marker.position.toJSON();
        getDetails(subscriber, marker);
        $('#get-victim-modal').modal('show');
    });
}

function getDetails(subscriber, marker) {
    var dest_latitude = subscriber.marker.getPosition().lat();
    var dest_longitude = subscriber.marker.getPosition().lng();

    var url = '/distance-matrix?' + "&origins=" + origin_latitude + "," + origin_longitude +
        "&destinations=" + dest_latitude + "," + dest_longitude;

    $.get(url, function (result) {
        var details = result.data.rows[0].elements[0];

        var distance = details.distance.text;
        var duration = details.duration.text;
        var origin = result.data.origin_addresses.toString();

        var details = "victim's location: " + result.data.destination_addresses.toString() + "<br>" +
            "distance from your location: " + distance + "<br>" +
            "estimated travel time: " + duration + "<br>";

        var sms = "help is coming from " + origin + ", " + distance +
            " away (estimate time of arrival: " + duration + ") ";

        $('#subscriber-location').html(details);
        $('#subscriber-number').html(subscriber.subscriberNumber);

        $('#subscriber-save').click(function () {
            var url = '/send-message?subscriber_number=' + subscriber.subscriberNumber + '&message=' + sms;

            $.get(url, function () {
                console.log('sms sent to ' + subscriber.subscriberNumber + 'with msg: ' + sms);
            });

            marker.setIcon('/images/markers/' + icons[6]);
            $('#get-victim-modal').modal('hide');
            $('#get-victim-modal').hide();
        });
    });
}