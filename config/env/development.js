module.exports = function (app) {
	return {
		port: process.env.PORT,
		baseUrl: '//localhost:1336',
		baseUrlStatic: '//static.localhost:1336'
	};
};
