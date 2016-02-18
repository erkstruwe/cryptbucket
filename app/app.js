module.exports = function (cb) {
	var express = require('express');
	var app = express();
	var lib = app.locals.lib = {};

// config
	lib.path = require('path');
	lib.dotenv = require('dotenv');
	lib.dotenv.load();
	app.locals.config = require('../config/env/' + app.get('env') + '.js')(app);

// node modules
	lib.fs = require('fs');
	lib.url = require('url');
	lib.util = require('util');

// app setup
	app.set('case sensitive routing', true);
	app.set('strict routing', true);
	app.set('x-powered-by', false);
//app.set('trust proxy', 1);
	app.set('views', lib.path.join(__dirname, 'views'));
	app.set('view engine', 'jade');

// dependencies
	lib.compression = require('compression');
	lib.helmet = require('helmet');
	lib.st = require('st');

// middleware
	app.use(lib.compression({}));
//app.use(lib.helmet.hsts({
//	maxAge: 1000 * 60 * 60 * 24, // 1 day
//	includeSubdomains: true
//}));
	app.use(lib.helmet.xssFilter());
	app.use(lib.helmet.frameguard());
	app.use(lib.helmet.hidePoweredBy());
	app.use(lib.helmet.ieNoOpen());
	app.use(lib.helmet.noSniff());

// static resources
	app.use(function (req, res, next) {
		if (req.hostname.match(/^static\./))
			req.url = '/static' + req.url;
		return next();
	});

	app.use(lib.st({
    path: lib.path.join(__dirname, '../.tmp'),
		url: 'static',
		index: false,
		gzip: false, // compression is already used
		cache: {
			content: {
				maxAge: 1000 * 60 * 60 * 24 * 180 // 180 days
			}
		},
		cors: true
	}));

// routing
	app.use(require('../config/router.js')(app, express));

// catch 404 and forward to error handler
	app.use(function (req, res, next) {
		var err = new Error('Not Found');
		err.status = 404;
		next(err);
	});

// error handler
	app.use(function (e, req, res, next) {
		res.status(e.status || 500);
		return res.send({
			message: e.message,
			error: app.get('env') === 'development' ? e : null
		});
	});

	app.listen(app.locals.config.port, function (e) {
		if (e) {
			console.error(e);
			return cb(e);
		}

		console.log('Listening on port', app.locals.config.port);
		return cb(null, app);
	});

	return app;
};

// start server if run from node command line
if (require.main === module)
	module.exports(function () {
	});
