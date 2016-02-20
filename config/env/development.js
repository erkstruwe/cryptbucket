module.exports = function (app) {
	var backend = {
		environment: app.get('env'),
		port: process.env.PORT,
		baseUrl: '//localhost:1336',
		baseUrlStatic: '//static.localhost:1336'
	};

	var frontend = app.locals.lib.lodash.pick(backend, 'baseUrl baseUrlStatic'.split(' '));
	app.locals.lib.lodash.merge(frontend, {
		fileStream: {
			chunkSize: 10 * 1024 // 10 kib
		}
	});

	return {
		backend: backend,
		frontend: frontend
	};
};
