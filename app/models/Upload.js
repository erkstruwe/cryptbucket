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
			url: {
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
				{unique: true, fields: ['url']}
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
