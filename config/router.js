module.exports = function (app, express) {
	var controllers = app.locals.controllers;
	var router = express.Router({});

	router.get('/', function (req, res, next) {
		return res.render('homepage');
	});

	router.get('/about', function (req, res, next) {
		return res.render('about');
	});

	router.get('/download/:uploadId', function (req, res, next) {
		return res.render('download', {
			uploadId: req.params.uploadId
		});
	});

	router.post('/api/upload/', controllers.UploadController.create);
	router.get('/api/upload/:id', controllers.UploadController.findById);
	router.get('/api/upload/:id/downloadPermission', controllers.UploadController.downloadPermission);
	router.put('/api/upload/:id/uploaded', controllers.UploadController.uploaded);

	return router;
};
