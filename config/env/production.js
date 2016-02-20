module.exports = function (app) {
	var backend = {
		environment: app.get('env'),
		port: process.env.PORT,
		baseUrl: '//cryptbucket.com',
		baseUrlStatic: '//cryptbucket.com/static'
	};

	var frontend = app.locals.lib.lodash.pick(backend, 'baseUrl baseUrlStatic'.split(' '));
	app.locals.lib.lodash.merge(frontend, {
		fileStream: {
			chunkSize: 16 * 1024 // 16 kib
		},
		uploadForm: {
			validation: {
				size: {
					max: 100 * 1024, // 100 kib
					maxTotal: 100 * 1024 // 100 kib
				}
			},
		}
	});

	return {
		backend: backend,
		frontend: frontend
	};
};
