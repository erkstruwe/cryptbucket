module.exports = function (app) {
	var lib = app.locals.lib;
	var models = app.locals.models;
	var sequelize = lib.sequelize;

	models.Upload.hasMany(models.File, {
		foreignKey: {
			allowNull: false
		}
	});
	models.File.belongsTo(models.Upload, {
		foreignKey: {
			allowNull: false
		},
		onUpdate: 'CASCADE',
		onDelete: 'RESTRICT'
	});
};
