"use strict";

var restify = require('restify');
var server = null;

exports.container = null;

exports.init = function(container, callback) {

    exports.container = container;

    this.start(callback);
};

exports.close = function(callback) {

    this.stop(callback);
};

exports.start = function(callback) {

    server = restify.createServer({
        name: 'noserv',
        version: '1.0.0'
    });

    server.listen(2337, function (err) {

        console.log('start server!');
        callback(err);
    });
};

exports.stop = function(callback) {

    server.close(function (err) {

        server = null;
        console.log('stop server!');
        callback(err);
    });
};

process.on('uncaughtException', function(err) {

});