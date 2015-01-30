/**
 * Created by Daesun on 14. 9. 22.
 */

var restify = require('restify');
var _ = require('underscore');

module.exports = function javascriptRoute(req, res, next) {

    // Javascript SDK 처리
    if(req.headers && (!req.headers['content-type'] || req.headers['content-type'] === 'text/plain' || req.headers['x-noserv-test'] === 'javascriptsdk')) {

        if(!req.headers['x-noserv-application-id'] && req.method.toUpperCase() === 'POST') {

            // javascript sdk 때문에..
            req.headers['content-type'] = 'application/json';

            console.log('javascript SDK');

            if(Buffer.isBuffer(req.body)) {

                req.body = JSON.parse(req.body);
            } else if(_.isString(req.body)) {

                console.log('string body : ' + req.body);

                if(req.body.charAt(0) === '{')
                    req.body = JSON.parse(req.body);
                else {

                    try {

                        req.body = JSON.parse('{"' + decodeURI(req.body).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g,'":"') + '"}')
                    } catch(e) {

                    }
                }
            }

            if(req.body && req.body._method && req.body._ApplicationId) {

                if(req.body._ApplicationId) {

                    req.headers['x-noserv-application-id'] = req.body._ApplicationId;
                    delete req.body._ApplicationId;
                }


                if(req.body._JavaScriptKey) {

                    req.headers['x-noserv-javascript-key'] = req.body._JavaScriptKey;
                    delete req.body._JavaScriptKey;
                }


                if(req.body._MasterKey) {

                    req.headers['x-noserv-master-key'] = req.body._MasterKey;
                    delete req.body._MasterKey;
                }


                if(req.body._SessionToken) {

                    req.headers['x-noserv-session-token'] = req.body._SessionToken;
                    delete req.body._SessionToken;
                }


                req.method = req.body._method.toUpperCase();
            }

            next();

        } else {

            next();
        }

    } else {

        next();
    }
};