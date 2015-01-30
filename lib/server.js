"use strict";

var route = require('./route/route');
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

    function unknownMethodHandler(req, res) {
        if (req.method.toLowerCase() === 'options') {
            console.log('received an options method request');
            var allowHeaders = ['Accept', 'Accept-Version', 'Content-Type', 'Api-Version', 'Origin', 'X-Requested-With', 'X-Noserv-Session-Token', 'X-Noserv-Application-Id', 'X-Noserv-Rest-Api-Key']; // added Origin & X-Requested-With

            if (res.methods.indexOf('OPTIONS') === -1) res.methods.push('OPTIONS');

            res.header('Access-Control-Allow-Credentials', true);
            res.header('Access-Control-Allow-Headers', allowHeaders.join(', '));
            res.header('Access-Control-Allow-Methods', res.methods.join(', '));
            res.header('Access-Control-Allow-Origin', req.headers.origin);

            return res.send(204);
        }
        else
            return res.send(new restify.MethodNotAllowedError());
    }

    server.on('MethodNotAllowed', unknownMethodHandler);

    server.server.timeout = 1000;

    route(server, exports.container);

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