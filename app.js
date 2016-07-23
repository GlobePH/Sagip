var express = require('express');
var path = require('path');
var exphbs = require('express-handlebars');
var app = express();
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var http = require('http').Server(app);
var io = require('socket.io')(http);
var request = require('request');
var orm = require('orm');

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
 * DB Settings
 * */

app.use(orm.express("postgres://fcngqaxoxsxrkl:B3kMIWRX3670EHb88vYplWqlmw@ec2-54-243-249-56.compute-1.amazonaws.com:5432/ddbglqj7okqt1a?ssl=true&sslfactory=org.postgresql.ssl.NonValidatingFactory", {
    define: function (db, models, next) {
        models.subscribers = db.define("subscribers", {
            access_token: String,
            subscriber_number: String,
            status: String,
            active: Boolean
        });

        models.location = db.define("location", {
            address: String,
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
            content: String,
            timestamp: Date
        });

        models.subscribers.hasOne('currentLocation', models.location);
        models.subscribers.hasOne('baseLocation', models.location);

        models.message.hasOne('sender', models.subscriber, {reverse: "messages"});

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
     * */

    var users;
    req.models.users.all(function (err, user) {
        if (err) throw error;
        users = user;
        res.send(JSON.stringify({"users": users}));
    });
});

app.get('/locate', function (req, res) {
    var units = req.query['units'];
    var origins = req.query['origins'];
    var destinations = req.query['destinations'];

    var url = 'https://maps.googleapis.com/maps/api/distancematrix/json?units=imperial&origins=' + origins + '&destinations=' + destinations + '&key=AIzaSyBKKTvirqm2LvwZaPD6ymCF5QS_oHueYfg';
    request(url, function (error, response, body) {
        res.send({"data": JSON.parse(body)});
    });

});

app.get('/location', function (req, res) {
    var id = req.query['id'];
    req.models.location.get(id, function (err, location) {
        console.log(JSON.stringify(location));
        res.send(JSON.stringify({"location": location}));
    });
});

app.get('/subscribers', function (req, res) {
    var subscribers;
    req.models.subscribers.all(function (err, subscriber) {
        if (err) throw error;
        subscribers = subscriber;
        res.send(JSON.stringify({"users": subscribers}));
    });
});

app.get('/send', function (req, res) {
    /*Send the sms message to notify url via GET to text subscriber
     * @param subscriber = where to send the msg
     * @param accessToken = at of subscriber
     * */
    req.models.subscribers.find({subscriber_number: "9754880843"}, function (err, data) {
        data = data[1];

        var subscriber = data.subscriber_number;
        var accessToken = data.access_token;
        var send_url = 'https://devapi.globelabs.com.ph/smsmessaging/v1/outbound/' + appShortCode + '/requests?access_token=' + accessToken;
        var message = "Hello";
        var data = {
            "outboundSMSMessageRequest": {
                "clientCorrelator": "123456",
                "senderAddress": "tel:" + 6966,
                "outboundSMSTextMessage": {"message": message},
                "address": ["tel:+" + subscriber]
            }
        };

        var options = {
            url: send_url,
            form: data
        };

        request.post(options, function (error, response, body) {
            console.log(body);
            if (!error && response.statusCode == 200) {
                console.log(body); // Show the HTML for the Google homepage.
                res.send({"status": "ok", "message": body});
            }
        })

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
    // TODO: CHECK IF SUBSCRIBER NUMBER ALREADY EXISTS, IF YES, SIMPLY UPDATE ACCESS TOKEN,
    // AND SET IS_ACTIVE TO TRUE.
    // TODO: Subscriber should be unique
    request(location_url, function (err, response, body) {
        if (!err && response.statusCode == 200) {
            console.log(body);
            locationJson = JSON.parse(body);
            console.log(locationJson.terminalLocationList);

            // TODO : For Testing
            currentLocation = locationJson.terminalLocationList.terminalLocation.currentLocation;
            address_url = "http://maps.googleapis.com/maps/api/geocode/json?latlng=" + currentLocation.latitude + "," + currentLocation.longitude;

            io.emit('add marker', currentLocation.latitude, currentLocation.longitude);

            request(address_url, function (err, response, body) {
                if (!err && response.statusCode == 200) {
                    console.log(body);
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
                                    subscriber.acces_token = accessToken;
                                    subscriber.active = true;
                                    subscriber.setCurrentLocation(location, function (err) {
                                        if (err) throw err;
                                    });
                                }).save(function (err) {
                                    if (err) throw err;
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

app.post(callbackUrl, function (request, response, next) {

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

app.post(notifyUrl, function (req, res, next) {
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
 * Socket.io
 */
// io.on('connection', function(socket){
//     socket.on('chat message', function(msg){
//
//     });
// });

/*
 * Listener
 */
http.listen(app.get('port'), function () {
    console.log('Node app is running on port', app.get('port'));
});
