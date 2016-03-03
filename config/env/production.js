module.exports = function (app) {
	var backend = {
		environment: app.get('env'),
		port: process.env.PORT,
		baseUrl: 'http://cryptbucket.com',
		baseUrlStatic: 'http://cryptbucket.com/static',
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
		s3: {
			defaultBucket: 'cryptbucket-prod',
			defaultFolder: 'standard',
			accessKeyId: process.env.S3_ACCESS_KEY_ID,
			secretAccessKey: process.env.S3_SECRET_ACCESS_KEY
		},
		validation: {
			size: {
				max: 100 * 1024, // 100 kiB
				maxTotal: 100 * 1024 // 100 kiB
			}
		},
		encryption: {
			pbkdf2: {
				iterations: 1336,
				digest: 'sha256'
			}
		}
	};

	try {
		backend.assets = app.locals.lib.jsonfile.readFileSync('.tmp/assets.json');
	} catch (e) {
		app.locals.lib.logger.warn('Could not load assets.json');
		backend.assets = {};
	}

	var frontend = app.locals.lib.lodash.pick(backend, 'baseUrl baseUrlStatic encryption assets'.split(' '));
	app.locals.lib.lodash.merge(frontend, {
		fileStream: {
			chunkSize: 16 * 1024 // 16 kiB
		},
		uploadForm: {
			validation: backend.validation
		}
	});

	return {
		backend: backend,
		frontend: frontend
	};
};
