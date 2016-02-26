module.exports = function (app) {
	var backend = {
		environment: app.get('env'),
		port: process.env.PORT,
		baseUrl: '//localhost:1336',
		baseUrlStatic: '//static.localhost:1336',
		db: {
			url: process.env.CLEARDB_DATABASE_URL,
			host: process.env.DB_HOST,
			database: process.env.DB_DATABASE,
			user: process.env.DB_USER,
			password: process.env.DB_PASSWORD,
			sync: true,
			forceSync: false, // Attention! This will drop all tables if true!
			logLevel: 'info'
		},
		s3: {
			defaultBucket: 'cryptbucket-dev',
			defaultFolder: 'standard',
			accessKeyId: process.env.S3_ACCESS_KEY_ID,
			secretAccessKey: process.env.S3_SECRET_ACCESS_KEY
		},
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
				iterations: 1336,
				digest: 'sha256'
			}
		}
	});

	return {
		backend: backend,
		frontend: frontend
	};
};
