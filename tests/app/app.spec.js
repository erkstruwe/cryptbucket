describe('app', function () {
	it('should listen without errors', function (cb) {
		require('../../app/app.js')(function (e, app) {
			expect(e).toBeNull();
			return cb();
		});
	});
});
