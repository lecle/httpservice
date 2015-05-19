var server = require('../lib/server');
var restify = require('restify');
var assert = require('assert');

var dummyContainer = {
    addListener:function(){},
    getConfig:function(){return null;},
    log : { info : function(log) { console.log(log)}, error : function(log) { console.log(log)}}
};

describe('server', function() {
    describe('#init()', function() {
        it('should initialize without error', function(done) {

            server.init(dummyContainer, function(err) {

                server.close(done);
            });
        });
    });

    describe('#unknownMethodHandler()', function() {
        it('should initialize without error', function(done) {

            server.init(dummyContainer, function(err) {

                var client = restify.createJsonClient({
                    url: 'http://localhost:3337',
                    version: '~1.0'
                });

                client.opts('/1/apps', function (err, req, res, obj) {

                    assert.equal(204, res.statusCode);

                    done(err);
                });
            });
        });
    });
});
