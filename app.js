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
//
app.use(orm.express('postgres://kxedkdjhlvemzg:AzFP0H0DB-uoCuJaxR4lme8BFq@ec2-54-243-200-63.compute-1.amazonaws.com:5432/d2sk2nbcgq8sju?ssl=true&sslfactory=org.postgresql.ssl.NonValidatingFactory', {
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

        models.history = db.define("history", {
            content: String,
            timestamp: Date
        });

        models.message_admin = db.define("message_admin", {
            content: String,
            timestamp: Date
        });

        models.subscribers.hasOne('currentLocation', models.location);
        models.subscribers.hasOne('baseLocation', models.location);

        models.message.hasOne('sender', models.subscriber, {reverse: "messages"});
        models.message_admin.hasOne('receiver', models.subscriber, {reverse: "message_admin"});

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
    console.log(appShortCode);
    res.render("home", {title: "Home", showBar: true});
});

app.get('/messaging', function (req, res) {
    res.render("messaging", {title: "Messaging", showBar: false});
});

app.get('/partners', function (req, res) {
    res.render("organizations", {title: "Partner Organizaztions", showBar: false});
});

app.get('/login', function (req, res) {
    res.render("login", {layout: "login-main", title: "Log In "});
});

app.get('/logs', function (req, res) {
    res.render("logs", {title: "Logs ", showBar: false});
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

app.get('/api/logs', function (req, res) {
    req.models.history.all(function (err, data) {
        if (err) throw error;
        res.send(JSON.stringify({"logs": data}));
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

app.get('/locations-by-id', function (req, res) {
    /*
     * Query all location
     * @param id = the location id that we want to retrieve specifically
     * */
    var id = req.query['id'];
    var subscriberId = req.query['subscriber_id'];
    if (id) {
        req.models.location.get(id, function (err, locations) {
            req.models.subscribers.get(subscriberId, function (err, subscriber) {
                if(err) throw err;
                locations.subscribers = subscriber;
                console.log(locations);
                res.send(JSON.stringify({"locations": locations}));
            });
        });
    } else {
        req.models.location.all(function (err, locations) {
            res.send(JSON.stringify({"locations": locations}));
        });
    }
});

app.get('/locations', function (req, res) {
    /*
     * Query all location
     * @param id = the location id that we want to retrieve specifically
     * */
    var id = req.query['id'];
    if (id) {
        req.models.location.get(id, function (err, locations) {
            if(err) throw err;
            console.log(locations);
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
    var filter = [req.query["filter"]];
    /*req.models.subscribers.find({active: true}).all(function (err, subscribers) {
     if (err) throw error;
     res.send(JSON.stringify({"subscribers": subscribers}));
     });*/

    if (req.query["filter"]) {
        req.models.subscribers.find({active: true}).where(" LOWER(status) = ?", filter).all(function (err, subscribers) {
            console.log("subscriber : " + subscribers[0]);
            res.send(JSON.stringify({"subscribers": subscribers}));
        });
    } else {
        req.models.subscribers.find({active: true}).all(function (err, subscribers) {
            console.log("subscriber : " + subscribers[0]);
            res.send(JSON.stringify({"subscribers": subscribers}));
        });

    }


});

app.get('/subscriber-messages', function (req, res) {
    var senderId = req.query['subscriber_id'];
    req.models.message.find({sender_id: senderId}).all(function (err, messages) {
        if (err) throw error;
        res.send(JSON.stringify({"messages": messages}));
    });
});

app.get('/admin-messages', function (req, res) {
    var receiverId = req.query['subscriber_id'];
    req.models.message_admin.find({receiver_id: receiverId}).all(function (err, messages) {
        if (err) throw error;
        res.send(JSON.stringify({"messages": messages}));
    });
});

app.get('/broadcast', function (req, res) {
    /*Send the sms message to notify url via GET to text subscriber
     * @param subscriber = where to send the msg
     * @param accessToken = at of subscriber
     * */
    req.models.subscribers.all(function (err, data) {
        console.log(data);
        sendBulk(req, data);
        res.send({});
    });
});

app.get('/thread', function (req, res) {
    var subscriberId = req.query['subscriberId'];
    req.models.message.find({sender: subscriberId}).all(function (senderMessages) {
        console.log(senderMessages);
        var messageThread = senderMessages;
        req.models.message.find({receiver: subscriberId}).all(function (receiverMessages) {
            console.log(messageThread);
            messageThread = messageThread.push.apply(receiverMessages);
            res.send(JSON.stringify({"messages": messageThread}));
        });
    });
});


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
        sendBulk(req, data);
        res.send({});
    });
});

app.get('/send-message', function (req, res) {
    var number = req.query['subscriber_number'];
    var message = req.query['message'];

    io.emit('new log', number, 'send', new Date().toLocaleString());
    send(req, number, message);
});

function sendBulk(req, data) {
    /*
     * Send SMS to an array of subscribers
     * */
    console.log("sending");
    for (var i = 0; i < data.length; i++) {
        console.log("before single send");
        console.log(data[i].subscriber_number);
        send(req, data[i].subscriber_number);
    }
}

function send(req, number, message) {
    /*
     * Send sms to a single number
     * */

    // Save to db first
    req.models.message_admin.create({
        content: message,
        timestamp: new Date()
    }, function (err, msg) {
        if (err) throw err;
        req.models.subscribers.find({subscriber_number: number}, function (err, subscriber) {
            if (err) throw err;
            msg.setReceiver(subscriber[0], function (err) {
                if (err) throw err;
            });
        });
    });

    req.models.subscribers.find({subscriber_number: number}, function (err, data) {
        data = data[0];
        var subscriber = data.subscriber_number;
        var accessToken = data.access_token;
        var send_url = 'https://devapi.globelabs.com.ph/smsmessaging/v1/outbound/' + appShortCode + '/requests?access_token=' + accessToken;
        var m = message;
        var form = {
            "outboundSMSMessageRequest": {
                "clientCorrelator": "123456",
                "senderAddress": "tel:" + 6966,
                "outboundSMSTextMessage": {"message": m},
                "address": ["tel:+" + subscriber]
            }
        };

        var options = {
            url: send_url,
            form: form
        };

        request.post(options, function (error, response, body) {
            console.log(body);
            if (!error && response.statusCode == 200) {
                console.log(body); // Show the HTML for the Google homepage.
                res.send({"status": "ok", "message": body});
            }
        })

    });
}


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


    request(location_url, function (err, response, body) {
        if (!err && response.statusCode == 200) {
            // console.log(body);
            locationJson = JSON.parse(body);
            // console.log(locationJson.terminalLocationList);

            // TODO : For Testing
            currentLocation = locationJson.terminalLocationList.terminalLocation.currentLocation;
            address_url = "https://maps.googleapis.com/maps/api/geocode/json?latlng=" + currentLocation.latitude + "," + currentLocation.longitude;

            io.emit('add marker', currentLocation.latitude, currentLocation.longitude, subscriberNumber);

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

app.get('/testing', function(req, res, next){
    var subscriberNumber = '9161085543';
    io.emit('change marker', subscriberNumber);
    res.send({});
});

app.post(notifyUrl, function (req, res, next) {
    // Receive the sms sent by the user
    var messageJson = req.body;
    var message = messageJson.inboundSMSMessageList.inboundSMSMessage[0].message;
    var subscriberNumber = messageJson.inboundSMSMessageList.inboundSMSMessage[0].senderAddress.slice(7);

    req.models.history.create({
        message: "Message received: " + message + " from: " + subscriberNumber,
        timestamp: new Date()
    }, function (err, log) {
        if (err) throw err;
        console.log(log);
    });

    console.log("Message received: " + message + " from: " + subscriberNumber);
    io.emit('change marker', subscriberNumber);
    io.emit('new log', subscriberNumber, 'receive', new Date().toLocaleString());

    /*req.models.message.create({
     content: message,
     timestamp: new Date()
     }, function (err, msg) {
     if (err) throw err;
     if(message.toUpperCase() == "SAGIP CANCEL") {
     req.models.subscribers.find({subscriber_number: subscriberNumber}, function (err, subscriber) {
     if (err) throw err;
     subscriber.status = "INDANGER";
     msg.setSender(subscriber[0], function (err) { if (err) throw err; });
     }).save(function (err) { if(err) throw err; });
     } else if(message.toUpperCase().startsWith("SAGIP")) {
     req.models.subscribers.find({subscriber_number: subscriberNumber}, function (err, subscriber) {
     if (err) throw err;
     subscriber.status = "IDLE";
     msg.setSender(subscriber[0], function (err) { if (err) throw err; });
     }).save(function (err) { if(err) throw err; });
     } else {
     req.models.subscribers.find({subscriber_number: subscriberNumber}, function (err, subscriber) {
     if (err) throw err;
     msg.setSender(subscriber[0], function (err) { if (err) throw err; });
     });
     }
     });*/

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
