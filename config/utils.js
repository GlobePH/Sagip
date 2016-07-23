var constants = require('./config');


exports.sendBulk = function (req, data) {
    /*
     * Send SMS to an array of subscribers
     * */
    console.log("sending");
    for (var i = 0; i < data.length; i++) {
        console.log("before single send");
        console.log(data[i].subscriber_number);
        exports.send(req, data[i].subscriber_number);
    }
};

exports.send = function (req, number, message) {
    /*
     * Send sms to a single number
     * */
    req.models.subscribers.find({subscriber_number: number}, function (err, data) {
        data = data[0];
        var subscriber = data.subscriber_number;
        var accessToken = data.access_token;
        var send_url = 'https://devapi.globelabs.com.ph/smsmessaging/v1/outbound/' + constants.appShortCode + '/requests?access_token=' + accessToken;
        var message = message;
        var form = {
            "outboundSMSMessageRequest": {
                "clientCorrelator": "123456",
                "senderAddress": "tel:" + 6966,
                "outboundSMSTextMessage": {"message": message},
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
};

module.exports = exports;