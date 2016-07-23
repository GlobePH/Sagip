$(document).ready(function() {
    initialize();
    addMarker(14.552048, 121.045539);
});

    var map;
    var origin_location;
    var markers = [];

    function initialize() {

        var latitude = 14.553406;
        var longitude = 121.049923;
        var mapContainer = $("#map-container")[0];

        origin_location = new google.maps.LatLng(latitude, longitude);

        var mapProperties = {
            center: origin_location,
            zoom: 13,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        }

        map = new google.maps.Map(mapContainer, mapProperties);
        console.log("new map created on: " + origin_location);

        addMarker(latitude, longitude);
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
/*        var url = "https://maps.googleapis.com/maps/api/distancematrix/json?units=imperial" +
                "&origins=" + dest_latitude + "," + dest_longitude +
                "&destinations=" + dest_latitude + "," + dest_longitude;
*/
//        var distanceMatrix  = new google.maps.DistanceMatrixService();

/*        origin = [];
        var distanceMatrix  = new google.maps.DistanceMatrixService();
        var distanceRequest = { origins: dest_latitude + "," + dest_longitude,
                                destinations: dest_latitude + "," + dest_longitude,
                                travelMode: google.maps.TravelMode.DRIVING, unitSystem: google.maps.UnitSystem.METRIC, avoidHighways: false, avoidTolls: false };
        distanceMatrix.getDistanceMatrix(distanceRequest, function(response, status) {
            if (status != google.maps.DistanceMatrixStatus.OK) {
                alert('Error was: ' + status);
            }
            else {
                var origins      = response.originAddresses;
                var destinations = response.destinationAddresses;
                console.log("pak");
                // rest of your code here...
            }


        });
*/
//        var url = "https://maps.googleapis.com/maps/api/distancematrix/json?units=imperial&origins=Washington,DC&destinations=New+York+City,NY&key=AIzaSyBKKTvirqm2LvwZaPD6ymCF5QS_oHueYfg";
        var url = '/locate' + "&origins=" + dest_latitude + "," + dest_longitude +
            "&destinations=" + dest_latitude + "," + dest_longitude;

        $.get(url, function(data) {
            console.log(data);
        });
    }