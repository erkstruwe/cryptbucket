module.exports = {
	create: function (req, res, next) {
		var opts = req.app.locals.lib.lodash.pick(req.body, ['salt', 'iv', 'challenge', 'challengeResult']);

		return req.app.locals.models.Upload.create(opts).nodeify(res.negotiate);
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
