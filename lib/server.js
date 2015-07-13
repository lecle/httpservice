"use strict";

var route = require('./route/route');
var restify = require('restify');
var server = null;
var serverSsl = null;

exports.container = null;

var serverPort = 80;

exports.init = function(container, callback) {

    exports.container = container;

    this.start(callback);
};

exports.close = function(callback) {

    this.stop(callback);
};

exports.start = function(callback) {

    function unknownMethodHandler(req, res) {
        if (req.method.toLowerCase() === 'options') {
            exports.container.log.info('received an options method request');
            var allowHeaders = ['Accept', 'Accept-Version', 'Content-Type', 'Api-Version', 'Origin', 'X-Requested-With', 'X-Noserv-Session-Token', 'X-Noserv-Application-Id', 'X-Noserv-Rest-Api-Key', 'X-Noserv-Master-Key']; // added Origin & X-Requested-With

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

    function setupServer(server) {

        server.on('MethodNotAllowed', unknownMethodHandler);

        server.server.timeout = 2000;

        route(server, exports.container);
    }

    server = restify.createServer({
        name: 'noserv',
        version: '1.0.0'
    });

    if(process.env.NODE_ENV === 'test')
        serverPort = 3337;

    setupServer(server);

    server.listen(serverPort, function (err) {

        if(err)
            return callback(err);

        exports.container.log.info('start server!');

        var sslConfig = exports.container.getConfig('ssl');

        if(sslConfig) {

            var fs = require('fs');

            var https_options = {
                key: fs.readFileSync(sslConfig.key),
                certificate: fs.readFileSync(sslConfig.certificate),
                ca : fs.readFileSync(sslConfig.ca),
                name: 'noserv',
                version: '1.0.0'
            };

            serverSsl = restify.createServer(https_options);

            setupServer(serverSsl);

            serverSsl.listen(443, function (err) {

                exports.container.log.info('start https server!');
                callback(err);
            });

        } else {

            callback(err);
        }
    });


};

exports.stop = function(callback) {

    if(server) {

        server.close(function (err) {

            server = null;
            exports.container.log.info('stop server!');
            callback(err);
        });
    }
};

process.on('uncaughtException', function(err) {

    exports.container.log.error(err.stack);
});
