module.exports = function (cb) {
	var express = require('express');
	var app = express();
	var lib = app.locals.lib = {};

	// config
	lib.path = require('path');
	lib.dotenv = require('dotenv');
	lib.lodash = require('lodash');
	lib.dotenv.load();
	var configObject = require('../config/env/' + app.get('env') + '.js')(app);
	app.locals.config = configObject.backend;
	app.locals.configFrontend = configObject.frontend;

	// node modules
	lib.fs = require('fs');
	lib.url = require('url');
	lib.util = require('util');

	// app setup
	app.set('case sensitive routing', true);
	app.set('strict routing', true);
	app.set('x-powered-by', false);
	app.set('trust proxy', 1);
	app.set('views', lib.path.join(__dirname, 'views'));
	app.set('view engine', 'jade');

	// dependencies
	lib.bodyParser = require('body-parser');
	lib.compression = require('compression');
	lib.helmet = require('helmet');
	lib.st = require('st');
	lib.async = require('async');
	lib.sequelize = require('sequelize');
	lib.logger = require('winston');

	// connect to database
	var dbOptions = {
		host: app.locals.config.db.host,
		dialect: 'mysql',
		pool: {
			max: 5,
			min: 0,
			idle: 9000
		},
		logging: function (msg) {
			return lib.logger.log(app.locals.config.db.logLevel, msg);
		},
		define: {
			freezeTableName: true
		}
	};

	if (app.locals.config.db.url) {
		app.locals.db = new lib.sequelize(
			app.locals.config.db.url,
			dbOptions
		);
	} else {
		app.locals.db = new lib.sequelize(
			app.locals.config.db.database,
			app.locals.config.db.user,
			app.locals.config.db.password,
			dbOptions
		);
	}

	// models
	app.locals.models = {};
	lib.lodash.chain(lib.fs.readdirSync(__dirname + '/models'))
		.filter(function (file) {
			return lib.lodash.endsWith(file, '.js') && file != 'relations.js';
		})
		.forEach(function (file) {
			app.locals.models[file.replace(/\.js$/i, '')] = require(__dirname + '/models/' + file)(app);
		})
		.value();
	require(__dirname + '/models/relations.js')(app);

	// controllers
	app.locals.controllers = {};
	lib.lodash.chain(lib.fs.readdirSync(__dirname + '/controllers'))
		.filter(function (file) {
			return lib.lodash.endsWith(file, '.js');
		})
		.forEach(function (file) {
			app.locals.controllers[file.replace(/\.js$/i, '')] = require(__dirname + '/controllers/' + file);
		})
		.value();

	// middleware
	app.use(lib.bodyParser.json());
	app.use(lib.bodyParser.urlencoded({extended: true}));
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

	// error handling
	app.use(function (req, res, next) {
		res.negotiate = function (e, r) {
			if (e) {
				console.error(e);
				if (e.message) {
					return res
						.status(e.status || 500)
						.send({
							message: e.message,
							stack: req.app.get('env') == 'development' ? e.stack : null
						});
				} else {
					return res.sendStatus(e.status || 500);
				}
			} else {
				return res.send(r);
			}
		};
		return next();
	});

	app.use(function (e, req, res, next) {
		res.status(e.status || 500);
		return res.send({
			message: e.message,
			error: app.get('env') === 'development' ? e : null
		});
	});

	// routing
	app.use(require('../config/router.js')(app, express));

	// catch 404 and forward to error handler
	app.use(function (req, res, next) {
		var err = new Error('Not Found');
		err.status = 404;
		next(err);
	});

	// start
	lib.async.auto({
		syncDb: function (cb) {
			if (app.locals.config.db.sync)
				return app.locals.db.sync({
					force: app.locals.config.db.forceSync, // Attention! When true, this will drop all tables!
					logging: function (msg) {
						return lib.logger.log(app.locals.config.db.logLevel, msg);
					}
				}).nodeify(cb);
			return cb();
		},
		bootstrap: ['syncDb', function (cb, r) {
			return require('./bootstrap.js')(app, cb);
		}],
		listen: ['syncDb', 'bootstrap', function (cb, r) {
			return app.listen(app.locals.config.port, cb);
		}]
	}, function (e) {
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
if (require.main === module) {
	module.exports(function () {
	});
}
