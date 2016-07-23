var express = require('express');
var path = require('path');
var exphbs = require('express-handlebars');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var request = require('request');
var orm = require('orm');

app.set('views', path.join(__dirname, 'views'));
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.use(express.static(path.join(__dirname, 'public')));

/*
 * DB Settings
 * */
app.use(orm.express("mysql://sagip:sagip@localhost/sagip", {
    define: function (db, models, next) {
        models.subscribers = db.define("subscribers", {
            access_token: String,
            subscriber_number: String,
            status: String,
            active: Boolean
        });

        models.location = db.define("location", {
            accuracy: String,
            altitude: String,
            latitude: String,
            longitude: String,
            map_url: String,
            timestamp: Date
        });

        models.organization = db.define("organization", {
            name: String
        });

        models.user = db.define("user", {
            user_name: String,
            password: String,
            access_token: String,
            subscriber_number: String,
            admin: Boolean
        });

        models.message = db.define("message", {
            content: String
        });

        models.subscribers.hasOne('currentLocation', models.location);
        models.subscribers.hasOne('baseLocation', models.location);

        models.user.hasOne("organization", models.organization);

        db.sync(function (err) {
            if (err) throw err;
        });
        next();
    }
}));


/*
 * Basic Routes
 */

app.get('/', function (req, res) {
    res.send('Hello World!');
});

/*
 * Sagip API
 * */
app.get('/users', function (req, res) {
    /*
     * @param filter: Filter users by subscribers / rescuers
     * */
    //
    var users;
    req.models.users.all(function(err, user) {
        if(err) throw error;
        users = user;
        res.send(JSON.stringify({"users": users}));
    });
});

app.get('/subscribers', function (req, res) {
    var subscribers;
    req.models.subscribers.all(function(err, subscriber) {
        if(err) throw error;
        subscribers = subscriber;
        res.send(JSON.stringify({"users": subscribers}));
    });
});

/*
 * Globe API
 * */

var appShortCode = '21586966'; // full short code
var appId = 'djd9H6bA76CG5Tj7zriAXnCGzj4LH68z'; // application id
var appSecret = '874841e787fe889888dbd6d36cf1e99e41c2ffb833fea71f71171f0d45f7ed44'; // application secret
var callbackUrl = '/callback';
var notifyUrl = '/sms';

app.get(callbackUrl, onProcessGETCallback);
function onProcessGETCallback(req, res, next) {
    var accessToken = req.query['access_token'];
    var subscriberNumber = req.query['subscriber_number'];
    var accuracy = 1;
    var location_url = 'https://devapi.globelabs.com.ph/location/v1/queries/location?access_token=' + accessToken + '&address=' + subscriberNumber + '&requestedAccuracy=' + accuracy;

    // TODO: Save subscriber isntance here (Jason)
    // TODO: Refactor (Roselle)

    request(location_url, function (err, response, body) {
        if (!err && response.statusCode == 200) {
            locationJson = body;
            console.log(locationJson);

            currentLocation = locationJson.terminalLocationList.terminalLocation.currentLocation;
            req.models.location.create({accuracy : currentLocation.accuracy,
                                        altitude : currentLocation.altitude,
                                        latitude : currentLocation.latitude,
                                        longitude : currentLocation.longitude,
                                        map_url : currentLocation.map_url,
                                        timestamp : new Date() }, function (err, location) {
                if (err) throw err;

                req.models.subscribers.create({access_token : accessToken,
                                                subscriber_number : subscriberNumber,
                                                status : "IDLE",
                                                active : 1} , function(err, subscribers) {
                    if (err) throw err;

                    subscribers.setCurrentLocation(location, function (err) {
                        if(err) throw err;
                    });
                });
            });
        }
    });

    return res.send({"status": "OK"});
}

app.post(callbackUrl, function (request, response, next) {
    console.log(JSON.stringify(request.body, null, 4));
});


/*
 * Listener
 */

http.listen(3000, function () {
    console.log('Example app listening on port 3000!');
});