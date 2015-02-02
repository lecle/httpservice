var server = require('../lib/server');

describe('server', function() {
    describe('#init()', function() {
        it('should initialize without error', function(done) {

            var dummyContainer = {addListener:function(){}};

            server.init(dummyContainer, function(err) {

                server.close(done);
            });
        });
    });

});