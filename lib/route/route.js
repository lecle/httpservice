var restify = require('restify');

module.exports = function(server, container) {

    var bodyParsers = restify.bodyParser({maxBodySize: 10240000 * 5});

    server.pre(bodyParsers[0]);

    server.pre(require('./javascriptRoute'));
    server.pre(require('./octetstreamFileRoute'));

    // restify handler 설정
    server.use(restify.acceptParser(server.acceptable));
    server.use(restify.queryParser());
    server.use(bodyParsers[1]);

    server.use(function (req, res, next) {

        res.methods.push('PUT');
        res.methods.push('DELETE');

        res.charSet('utf-8');

        next();
    });

    server.use(restify.CORS());
    server.use(restify.fullResponse());


    server.get('/docs/.*/', restify.serveStatic({
        directory: './public',
        default: 'api.html'
    }));

    server.get('/files/.*/', restify.serveStatic({
        directory: './public'
    }));

    server.get('/sdks/.*/', restify.serveStatic({
        directory: './public'
    }));

    server.get('/ping', function(req, res, next) {

        res.send(200, {pong:'OK'});
        next();
    });

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
    server.patch('/:_version/:_module', route);
    server.patch('/:_version/:_module/:_query1', route);
    server.patch('/:_version/:_module/:_query1/:_query2', route);

    server.on('uncaughtException', function (req, res, route, err) {

        container.log.error('uncaughtException', err.stack);
    });

    var mainPage = container.getConfig('mainPage');

    if(mainPage) {

        server.get('/', function(req, res, next) {

            res.header('Location', mainPage);
            res.send(302);
        });
    }

    function route(req, res, next) {

        var reqData = {};

        reqData.params = req.params;
        reqData.body = req.body;

        if (Buffer.isBuffer(req.body) && req.headers['content-type'] === 'application/json') {

            reqData.body = JSON.parse(req.body);
        }

        reqData.url = req.url;
        reqData.method = req.method;
        reqData.headers = req.headers;
        reqData.files = req.files;
        reqData.contentType = req.getContentType();

        var returnCode = 200;

        if(req.method.toUpperCase() === 'POST')
            returnCode = 201;

        container.log.debug('http request', reqData);

        container.getService('').then(function(service) {

            service.send('request', reqData, function(err, response) {

                if(err) {

                    if(err.responseCode) {

                        err.statusCode = err.responseCode;
                        err.body = { code: err.responseCode, message: err.responseCode };
                    }

                    return next(err);
                }

                if(response.statusCode)
                    returnCode = response.statusCode;

                if(response.data && response.data._headers) {

                    for(var key in response.data._headers) {

                        res.headers[key] = response.data._headers[key];
                    }

                    delete response.data.headers;
                }

                res.send(returnCode, response.data);

                container.log.debug('http response', response.data);

                next();
            });
        }).fail(function(err) {

            next(new restify.ResourceNotFoundError('ResourceNotFound'));
        });
    }
};
