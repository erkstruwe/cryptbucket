module.exports = function (app, express) {
	var controllers = app.locals.controllers;
	var router = express.Router({});

	router.get('/', function (req, res, next) {
		return res.render('homepage');
	});

	return router;
};
