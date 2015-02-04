var server = require('../lib/server');
var restify = require('restify');
var assert = require('assert');

describe('route', function() {

    var client = null;

    before(function(done) {

        var dummyContainer = {
            addListener : function(){},
            getService : function(name) {

                return {
                    then : function(callback){ callback({send : function(command, data, callback) {

                        callback(null, {data : {test : 'OK'}});
                    }})},
                    fail : function(){}
                };
            }
        };

        server.init(dummyContainer, function(err) {

            done();
        });

        client = restify.createJsonClient({
            url: 'http://localhost:3337',
            version: '~1.0',
            headers: {
                'X-Noserv-Session-Token' : 'supertoken',
                'X-Noserv-Application-Id' : 'supertoken'
            }
        });
    });

    after(function(done) {
        server.close(done);
    });

    describe('rest api post', function() {
        it('should route without error', function(done) {

            client.post('/1/apps', {appname:'test1'}, function (err, req, res, obj) {

                assert.equal(201, res.statusCode);

                done(err);
            });
        });
    });

});