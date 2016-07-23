var express = require('express');
var path = require('path');
var exphbs = require('express-handlebars');
var app = express();
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var http = require('http').Server(app);
var io = require('socket.io')(http);
var orm = require('orm');
var request = require('request');

/*
 * Important: User defined js files to divide the code
 * */
var utils = require('./config/utils');
var config = require('./config/config');
var philippines = require('philippines');
var cities = require('philippines/cities');

/*
 * Node settings
 * */
app.set('port', (process.env.PORT || 5000));
app.set('views', path.join(__dirname, 'views'));
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

/*
 * DB Settings: Add/Update schema in file
 * */
app.use(orm.express(config.database_url, {
    define: function (db, models, next) {
        models.subscribers = db.define("subscribers", {
            access_token: String,
            subscriber_number: String,
            status: String,
            active: Boolean
        });

        models.locations = db.define("location", {
            address: String,
            accuracy: String,
            altitude: String,
            latitude: String,
            longitude: String,
            map_url: String,
            timestamp: Date
        });

        models.organizations = db.define("organization", {
            name: String
        });

        models.users = db.define("user", {
            user_name: String,
            password: String,
            access_token: String,
            subscriber_number: String,
            admin: Boolean
        });

        models.messages = db.define("message", {
            sender: String,
            receiver: String,
            content: String,
            timestamp: Date
        });

        models.subscribers.hasOne('currentLocation', models.locations);
        models.subscribers.hasOne('baseLocation', models.locations);
        models.messages.hasOne('sender', models.subscribers, {reverse: "messages"});
        models.messages.hasOne('receiver', models.users, {reverse: "messages"});
        models.users.hasOne("organization", models.organizations);

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
    res.render("home", {title: "Home", showBar: true});
});

app.get('/messaging', function (req, res) {
    res.render("messaging", {title: "Messaging ", showBar: false});
});


/*
 * Sagip API
 * */
app.get('/users', function (req, res) {
    /*
     * @param filter: Filter users by subscribers / rescuers
     * @param id: get specific user
     * */
    var id = req.query['id'];
    req.models.users.all(function (err, users) {
        if (err) throw error;
        res.send(JSON.stringify({"users": users}));
    });
});

app.get('/locations', function (req, res) {
    /*
     * Query all location
     * @param id = the location id that we want to retrieve specifically
     * */
    var id = req.query['id'];
    if (id) {
        req.models.locations.get(id, function (err, locations) {
            res.send(JSON.stringify({"locations": locations}));
        });
    } else {
        req.models.location.all(function (err, locations) {
            res.send(JSON.stringify({"locations": locations}));
        });
    }
});

app.get('/locations-all', function (req, res) {
    var locations = [];
    for (var i = 0; i < cities.length; i++) {
        if (cities[i].province == "MM")
            locations.push(cities[i]);
    }
    res.send(JSON.stringify({"locations": locations}));
});

app.get('/subscribers', function (req, res) {
    req.models.subscribers.find({active: true}).all(function (err, subscribers) {
        if (err) throw error;
        res.send(JSON.stringify({"subscribers": subscribers}));
    });
});

// app.get('/thread', function (req, res) {
//     var subscriberId = req.query['subscriberId'];
//     req.models.messages.find({sender: subscriberId}).all(function (senderMessages) {
//         console.log(senderMessages);
//         var messageThread = senderMessages;
//         req.models.messages.find({receiver: subscriberId}).all(function (receiverMessages) {
//             console.log(messageThread);
//             messageThread = messageThread.push.apply(receiverMessages);
//             res.send(JSON.stringify({"messages": messageThread}));
//         });
//     });
// });


app.get('/distance-matrix', function (req, res) {
    var units = req.query['units'];
    var origins = req.query['origins'];
    var destinations = req.query['destinations'];

    var url = 'https://maps.googleapis.com/maps/api/distancematrix/json?units=imperial&origins=' + origins + '&destinations=' + destinations + '&key=AIzaSyBKKTvirqm2LvwZaPD6ymCF5QS_oHueYfg';
    request(url, function (error, response, body) {
        res.send({"data": JSON.parse(body)});
    });
});


app.get('/broadcast-message', function (req, res) {
    /*Send the sms message to notify url via GET to text subscriber
     * @param subscriber = where to send the msg
     * @param accessToken = at of subscriber
     * */
    req.models.subscribers.all(function (err, data) {
        utils.sendBulk(req, data);
        res.send({});
    });
});

app.get('/send-message', function (req, res) {
    var number = req.query['subscriber_number'];
    var message = req.query['message'];
    utils.send(req, number, message);
});

/*
 * Globe API
 * */

app.get(config.callbackUrl, onProcessGETCallback);
function onProcessGETCallback(req, res, next) {
    var accessToken = req.query['access_token'];
    var subscriberNumber = req.query['subscriber_number'];
    var accuracy = 1;
    var location_url = 'https://devapi.globelabs.com.ph/location/v1/queries/location?access_token=' + accessToken + '&address=' + subscriberNumber + '&requestedAccuracy=' + accuracy;


    request(location_url, function (err, response, body) {
        if (!err && response.statusCode == 200) {
            // console.log(body);
            locationJson = JSON.parse(body);
            // console.log(locationJson.terminalLocationList);

            // TODO : For Testing
            currentLocation = locationJson.terminalLocationList.terminalLocation.currentLocation;
            address_url = "http://maps.googleapis.com/maps/api/geocode/json?latlng=" + currentLocation.latitude + "," + currentLocation.longitude;

            io.emit('add marker', currentLocation.latitude, currentLocation.longitude);

            request(address_url, function (err, response, body) {
                if (!err && response.statusCode == 200) {
                    // console.log(body);
                    addressJson = JSON.parse(body);
                    var address = addressJson.results[0].formatted_address;


                    req.models.location.create({
                        address: address,
                        accuracy: currentLocation.accuracy,
                        altitude: currentLocation.altitude,
                        latitude: currentLocation.latitude,
                        longitude: currentLocation.longitude,
                        map_url: currentLocation.map_url,
                        timestamp: new Date()
                    }, function (err, location) {
                        if (err) throw err;

                        req.models.subscribers.exists({subscriber_number: subscriberNumber}, function (err, exists) {
                            if (err) throw err;
                            if (exists) {
                                req.models.subscribers.find({subscriber_number: subscriberNumber}).each(function (subscriber) {
                                    console.log("When updating");
                                    console.log(accessToken);
                                    subscriber.access_token = accessToken;
                                    subscriber.active = true;
                                    subscriber.setBaseLocation(location, function (err) {
                                        if (err) throw err;
                                    })
                                    subscriber.setCurrentLocation(location, function (err) {
                                        if (err) throw err;
                                    });
                                }).save(function (err) {
                                    if (err) throw err;
                                    console.log("Subscriber updated");
                                });
                            } else {
                                req.models.subscribers.create({
                                    access_token: accessToken,
                                    subscriber_number: subscriberNumber,
                                    status: "IDLE",
                                    active: true,
                                }, function (err, subscriber) {
                                    if (err) throw err;
                                    subscriber.setCurrentLocation(location, function (err) {
                                        if (err) throw err;
                                    });
                                });
                            }
                        });
                    });
                }
            });
        }
    });

    return res.send({"status": "OK"});
}

app.post(config.callbackUrl, function (request, response, next) {
    console.log(JSON.stringify(request.body, null, 4));
    subscriberNumber = request.body.unsubscribed.subscriber_number;
    console.log(subscriberNumber);
    request.models.subscribers.find({subscriber_number: subscriberNumber}).each(function (subscriber) {
        console.log("SAVINGGG");
        console.log(subscriber);
        subscriber.active = false;
    }).save(function (err) {
        if (err) throw err;
    });
});

app.post(config.notifyUrl, function (req, res, next) {
    // Receive the sms sent by the user
    var messageJson = req.body;
    console.log(messageJson);
    console.log(messageJson.inboundSMSMessageList);
    var message = messageJson.inboundSMSMessageList.inboundSMSMessage[0].message;
    var subscriberNumber = messageJson.inboundSMSMessageList.inboundSMSMessage[0].senderAddress.slice(7);
    console.log(subscriberNumber);

    req.models.message.create({
        content: message,
        timestamp: new Date()
    }, function (err, msg) {
        if (err) throw err;
        req.models.subscribers.find({subscriber_number: subscriberNumber}, function (err, subscriber) {
            if (err) throw err;
            msg.setSender(subscriber[0], function (err) {
                if (err) throw err;
            });
        });
    });

    res.send(JSON.stringify(req.body, null, 4));
});


/*
 * Socket.io
 */

io.on('connection', function (socket) {
    socket.on('chat message', function (msg) {
        io.emit('chat message', msg);
    });
});

/*
 * Listener
 */
http.listen(app.get('port'), function () {
    console.log('Node app is running on port', app.get('port'));
});


module.exports = app;