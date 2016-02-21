module.exports = function (app) {
	var lib = app.locals.lib;
	var models = app.locals.models;
	var sequelize = lib.sequelize;

	//models.Article.belongsTo(models.User, {
	//});
	//
	//models.User.belongsToMany(models.Product, {
	//	through: 'UserProductFavorite'
	//});
	//models.Product.belongsToMany(models.User, {
	//	through: 'UserProductFavorite'
	//});
};
