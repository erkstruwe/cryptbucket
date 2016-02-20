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
			chunkSize: 16 * 1024 // 16 kib
		},
		uploadForm: {
			validation: {
				size: {
					max: 100 * 1024 * 1024, // 100 Mib
					maxTotal: 100 * 1024 * 1024 // 100 Mib
				}
			},
		}
	});

	return {
		backend: backend,
		frontend: frontend
	};
};
