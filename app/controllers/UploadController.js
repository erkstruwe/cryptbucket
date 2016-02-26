module.exports = {
	create: function (req, res, next) {
		var opts = req.app.locals.lib.lodash.pick(req.body, ['salt', 'iv', 'challenge', 'challengeResult', 'files']);

		return req.app.locals.lib.async.auto({
			upload: function (cb) {
				return req.app.locals.models.Upload.create(opts, {include: [req.app.locals.models.File]}).nodeify(cb);
			},
			signedRequest: ['upload', function (cb, r) {
				var params = {
					Bucket: r.upload.bucket,
					Key: r.upload.folder + '/' + r.upload.filename,
					Expires: 86400, // 1d
					ContentType: 'application/json;charset=utf-8'
				};

				return req.app.locals.lib.s3.getSignedUrl('putObject', params, cb);
			}]
		}, res.negotiate);
	},

	uploaded: function (req, res, next) {
		var opts = {
			id: req.params.id,
			challengeResult: req.body.challengeResult
		};

		return req.app.locals.models.Upload.update({status: 'uploaded'}, {where: opts}).nodeify(function (e, r) {
			if (e)
				return res.negotiate(e);

			if (r[0] === 0)
				return res.sendStatus(404);

			return res.send();
		});
	}
};
