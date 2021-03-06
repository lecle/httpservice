var restify = require('restify');
var _ = require('underscore');

module.exports = function javascriptRoute(req, res, next) {

    // Javascript SDK 처리
    if(req.headers && (!req.headers['content-type'] || req.headers['content-type'].indexOf('text/plain') === 0 || req.headers['x-noserv-test'] === 'javascriptsdk')) {

        if(!req.headers['x-noserv-application-id'] && req.method.toUpperCase() === 'POST') {

            // javascript sdk 때문에..
            req.headers['content-type'] = 'application/json';

            if(Buffer.isBuffer(req.body)) {

                req.body = JSON.parse(req.body);
            } else if(_.isString(req.body)) {

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
                delete req.body._method;
            }

            if(req.method === 'GET' && !_.isEmpty(req.body)) {

                var query = '';

                for(var key in req.body) {

                    if(query)
                        query += '&';
                    else
                        query = '?';

                    query += key;
                    query += '=';

                    if(typeof(req.body[key]) === 'object')
                        query += encodeURIComponent(JSON.stringify(req.body[key]));
                    else
                        query += encodeURIComponent(req.body[key]);

                }

                req.url += query;

                req.body = {};
            }

            next();

        } else {

            next();
        }

    } else {

        next();
    }
};
