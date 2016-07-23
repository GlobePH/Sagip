var express = require('express');
var orm = require('orm');

exports.appShortCode = '21586966'; // full short code
exports.appId = 'djd9H6bA76CG5Tj7zriAXnCGzj4LH68z'; // application id
exports.appSecret = '874841e787fe889888dbd6d36cf1e99e41c2ffb833fea71f71171f0d45f7ed44'; // application secret
exports.callbackUrl = '/callback';
exports.notifyUrl = '/sms';

var params = '?ssl=true&sslfactory=org.postgresql.ssl.NonValidatingFactory';
exports.database_url = 'postgres://kxedkdjhlvemzg:AzFP0H0DB-uoCuJaxR4lme8BFq@ec2-54-243-200-63.compute-1.amazonaws.com:5432/d2sk2nbcgq8sju' + params;

exports.cors =

exports.models =

module.exports = exports;