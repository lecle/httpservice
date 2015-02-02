var restify = require('restify');

module.exports = function(server, container) {

    var bodyParsers = restify.bodyParser({maxBodySize: 10240000});

    server.pre(bodyParsers[0]);

    server.pre(require('./javascriptRoute'));

    // restify handler 설정
    server.use(restify.acceptParser(server.acceptable));
    server.use(restify.queryParser());
    server.use(bodyParsers[1]);

    server.use(function (req, res, next) {

        res.methods.push('PUT');
        res.methods.push('DELETE');

        next();
    });

    server.use(restify.CORS());
    server.use(restify.fullResponse());

    server.get('/:_version/:_module', route);
    server.get('/:_version/:_module/:_query1', route);
    server.get('/:_version/:_module/:_query1/:_query2', route);
    server.post('/:_version/:_module', route);
    server.post('/:_version/:_module/:_query1', route);
    server.post('/:_version/:_module/:_query1/:_query2', route);
    server.put('/:_version/:_module', route);
    server.put('/:_version/:_module/:_query1', route);
    server.put('/:_version/:_module/:_query1/:_query2', route);
    server.del('/:_version/:_module', route);
    server.del('/:_version/:_module/:_query1', route);
    server.del('/:_version/:_module/:_query1/:_query2', route);


    server.get('/docs/.*/', restify.serveStatic({
        directory: './public',
        default: 'api.html'
    }));

    server.get('/files/.*/', restify.serveStatic({
        directory: './public'
    }));

    function route(req, res, next) {

        var reqData = {};

        reqData.params = req.params;
        reqData.body = req.body;

        if (Buffer.isBuffer(req.body)) {

            reqData.body = JSON.parse(req.body);
        }

        reqData._method = req.method;

        var returnCode = 200;

        if(req.method.toUpperCase() === 'POST')
            returnCode = 201;

        container.getService('', function(err, service) {

            if(err) {

                return next(new restify.ResourceNotFoundError('ResourceNotFound'));
            }

            service.send('request', reqData, function(err, response) {

                next.ifError(err);

                res.send(returnCode, response.data);
            });

        });

        res.charSet('utf-8');

        next();
    }
};