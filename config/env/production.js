module.exports = function (app) {
	var backend = {
		environment: app.get('env'),
		port: process.env.PORT,
		baseUrl: '//cryptbucket.com',
		baseUrlStatic: '//cryptbucket.com/static',
		db: {
			url: process.env.CLEARDB_DATABASE_URL,
			host: process.env.DB_HOST,
			database: process.env.DB_DATABASE,
			user: process.env.DB_USER,
			password: process.env.DB_PASSWORD,
			sync: true,
			forceSync: false, // Attention! This will drop all tables if true!
			logLevel: 'verbose'
		},
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
				iterations: 1000,
				digest: 'sha256'
			}
		}
	});

	return {
		backend: backend,
		frontend: frontend
	};
};
