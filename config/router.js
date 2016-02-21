module.exports = function (app, express) {
	var controllers = app.locals.controllers;
	var router = express.Router({});

	router.get('/', function (req, res, next) {
		return res.render('homepage');
	});

	router.post('/api/upload/', controllers.UploadController.create);
	router.put('/api/upload/:id/uploaded', controllers.UploadController.uploaded);

	return router;
};
