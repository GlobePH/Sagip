$(document).ready(function () {
    initializeMap();

    var socket = io();

    socket.on('add marker', function (lat, lng) {
        addMarker(lat, lng);
    });

    socket.on('remove marker', function (lat, lng) {
        addMarker(lat, lng);
    });

    socket.on('add message', function (msg) {
        console.log(msg);
    });

    $("#floating-filter").on("click", function () {
        setMapOnMarkers(null, markers);
        var filter = $('input:checkbox:checked').attr('id');
        console.log(filter);
        fetchFromDataSource(filter);
    });

    $('get-victim-modal').on('shown.bs.modal', function (){
    });

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
            }

            map = new google.maps.Map(mapContainer, mapProperties);
            console.log("new map created on: " + origin_location);

            addMarker(origin_latitude, origin_longitude, icons[6]);
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
                addMarker(location.latitude, location.longitude, icons[1]);
            });
        }
    });
}

function addMarker(latitude, longitude, icon) {
    var location = new google.maps.LatLng(latitude, longitude);
    var marker = new google.maps.Marker({
        position: location,
        map: map,
        icon: '../img/markers/' + icon
    });
    markers.push(marker);
    addEventListenerToMarker(marker);
    map.panTo(location);
    console.log("new marker added on: " + location);
}

function setMapOnMarkers(map, list) {
    for (var i = 0; i < list.length; i++) {
        list[i].setMap(map);
    }
}

function addEventListenerToMarker(marker) {
    marker.addListener('click', function () {
        var location = marker.position.toJSON();
        getDetails(location.lat, location.lng);
        $('#get-victim-modal').modal('open');
    });
}

function getDetails(dest_latitude, dest_longitude) {
    var url = '/distance-matrix?' + "&origins=" + origin_latitude + "," + origin_longitude +
        "&destinations=" + dest_latitude + "," + dest_longitude;

    $.get(url, function (result) {
        var details = result.data.rows[0].elements[0];
        var distance = details.distance.text;
        var duration = details.duration.text;
        var origin = result.data.origin_addresses[0];
        console.log("\nhelp is coming from " + origin + ",\n\t" + distance +
            " away (estimate time of arrival: " + duration + ")");
    });
}