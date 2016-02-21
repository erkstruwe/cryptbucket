module.exports = function (app) {
	var backend = {
		environment: app.get('env'),
		port: process.env.PORT,
		baseUrl: '//localhost:1336',
		baseUrlStatic: '//static.localhost:1336',
		validation: {
			size: {
				max: 100 * 1024 * 1024, // 100 MiB
				maxTotal: 100 * 1024 * 1024 // 100 MiB
			}
		}
	};

	var frontend = app.locals.lib.lodash.pick(backend, 'baseUrl baseUrlStatic'.split(' '));
	app.locals.lib.lodash.merge(frontend, {
		fileStream: {
			chunkSize: 16 * 1024 // 16 kib
		},
		uploadForm: {
			validation: backend.validation
		},
		encryption: {
			pbkdf2: {
				iterations: 10000,
				digest: 'sha256'
			}
		}
	});

	return {
		backend: backend,
		frontend: frontend
	};
};
