
var server = require('../lib/server');
var restify = require('restify');
var assert = require('assert');

describe('javascriptRoute', function() {

    var client = null;

    before(function(done) {

        var dummyContainer = {
            addListener : function(){},
            getService : function(name, callback) {

                callback(null, {send : function(command, data, callback) {

                    callback(null, {data : {test : 'OK'}});
                }});
            }

        };

        server.init(dummyContainer, done);

        client = restify.createStringClient({
            url: 'http://localhost:3337',
            version: '~1.0',
            headers: {
                'x-noserv-test' : 'javascriptsdk'
            }
        });
    });

    after(function(done) {
        server.close(done);
    });

    describe('rest api post', function() {
        it('should route without error', function(done) {

            client.post('/1/apps', JSON.stringify({"_ApplicationId":"supertoken", "_JavaScriptKey":"supertoken", "_SessionToken":"supertoken", "_MasterKey":"supertoken", "_method":"POST", "appname":"test14"}), function (err, req, res, obj) {

                assert.equal(201, res.statusCode);

                done(err);
            });
        });
    });

});