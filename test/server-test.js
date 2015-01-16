var manager = require('../lib/server');

describe('server', function() {
    describe('#init()', function() {
        it('should initialize without error', function(done) {

            // manager service load
            var dummyContainer = {addListener:function(){}};

            manager.init(dummyContainer, function(err) {

                manager.close(done);
            });
        });
    });

});