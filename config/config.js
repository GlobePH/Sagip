var express = require('express');
var orm = require('orm');

exports.appShortCode = '21586966'; // full short code
exports.appId = 'djd9H6bA76CG5Tj7zriAXnCGzj4LH68z'; // application id
exports.appSecret = '874841e787fe889888dbd6d36cf1e99e41c2ffb833fea71f71171f0d45f7ed44'; // application secret
exports.callbackUrl = '/callback';
exports.notifyUrl = '/sms';

var params = '?ssl=true&sslfactory=org.postgresql.ssl.NonValidatingFactory';
exports.database_url = 'postgres://kxedkdjhlvemzg:AzFP0H0DB-uoCuJaxR4lme8BFq@ec2-54-243-200-63.compute-1.amazonaws.com:5432/d2sk2nbcgq8sju' + params;

exports.cors = function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
};

exports.models = function (db, models, next) {
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
};

module.exports = exports;