module.exports = function (app) {
	var lib = app.locals.lib;
	var sequelize = lib.sequelize;

	return app.locals.db.define(
		app.locals.lib.path.basename(__filename, '.js').toLowerCase(),
		{
			id: {
				type: sequelize.UUID,
				defaultValue: sequelize.UUIDV4,
				primaryKey: true
			},
			status: {
				type: sequelize.ENUM(['created', 'uploaded']),
				allowNull: false,
				defaultValue: 'created'
			},
			bucket: {
				type: sequelize.STRING(32),
				allowNull: false,
				defaultValue: app.locals.config.s3.defaultBucket
			},
			folder: {
				type: sequelize.STRING(32),
				allowNull: false,
				defaultValue: app.locals.config.s3.defaultFolder
			},
			filename: {
				type: sequelize.UUID,
				allowNull: false,
				defaultValue: sequelize.UUIDV4
			},
			salt: {
				type: sequelize.CHAR(255).BINARY,
				allowNull: false
			},
			iv: {
				type: sequelize.CHAR(16).BINARY,
				allowNull: false
			},
			challenge: {
				type: sequelize.CHAR(255).BINARY,
				allowNull: false
			},
			challengeResult: {
				type: sequelize.CHAR(255).BINARY,
				allowNull: false
			}
		},
		{
			paranoid: true,
			indexes: [
				{unique: true, fields: ['filename']}
			],
			instanceMethods: {
				toJSON: function () {
					return app.locals.lib.lodash.pick(this.get(), ['id', 'salt', 'challenge']);
				}
			},
			classMethods: {}
		}
	);
};
