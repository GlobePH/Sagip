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
            base_location: String,
            cuurent_location: String,
            status: String,
            active: Boolean
        });
        db.sync(function (err) {
            if (err) throw err;
        });
        next();
    }
}));


/*
 * Routes
 */

app.get('/', function (req, res) {
    res.send('Hello World!');
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

    // Save subscriber isntance here

    request(location_url, function (err, response, body) {
        if (!err && response.statusCode == 200) {
            location = body;
            console.log(location);

            // Save location instance here

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