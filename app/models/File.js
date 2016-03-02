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
			size: {
				type: sequelize.INTEGER,
				allowNull: false
			},
			md5: {
				type: sequelize.STRING(16),
				allowNull: true
			},
			extension: {
				type: sequelize.STRING(8),
				allowNull: false
			},
			mimetype: {
				type: sequelize.STRING(16),
				validate: {
					notEmpty: true
				}
			}
		},
		{
			paranoid: true,
			indexes: [],
			instanceMethods: {
				toJSON: function () {
					return app.locals.lib.lodash.pick(this.get(), ['extension', 'mimetype']);
				}
			},
			classMethods: {}
		}
	);
};
