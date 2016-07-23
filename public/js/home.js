$(document).ready(function(){
    alert("hello");

    var originLocation;
    var map;

    function initialize() {
        var latitude = 14.553406;
        var longitude = 121.049923;
        var mapContainer = $("#map-container");
        var originLocation = new google.maps.LatLng(latitude, longitude);

        var mapAttributes = {
            center : originLocation,
            zoom : 13,
            mapTypeId : google.maps.MapTypeId.ROADMAP
        }

        map = new google.maps.Maps(mapContainer, mapAttributes);
    }

});