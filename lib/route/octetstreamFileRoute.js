module.exports = function octetstreamFileRoute(req, res, next) {

    if(req.headers['content-type'] && req.headers['content-type'].match(/octet-stream/i)) {

        var formidable = require('formidable');

        var form = new formidable.IncomingForm();

        form.maxFieldsSize = 10 * 1024 * 1024;

        form.parse(req, function (err, fields, files) {
            if (err)
                return (next(new Error(err.message)));

            req.body = fields;
            req.files = files;

            next();
        });
    } else {

        next();
    }
};
