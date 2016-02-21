module.exports = function (app) {
	var backend = {
		environment: app.get('env'),
		port: process.env.PORT,
		baseUrl: '//cryptbucket.com',
		baseUrlStatic: '//cryptbucket.com/static',
		validation: {
			size: {
				max: 100 * 1024, // 100 kiB
				maxTotal: 100 * 1024 // 100 kiB
			}
		}
	};

	var frontend = app.locals.lib.lodash.pick(backend, 'baseUrl baseUrlStatic'.split(' '));
	app.locals.lib.lodash.merge(frontend, {
		fileStream: {
			chunkSize: 16 * 1024 // 16 kiB
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
