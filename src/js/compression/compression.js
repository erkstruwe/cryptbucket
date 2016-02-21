// external libraries
var zlib = require('zlib');

// external modules

// components

angular
	.module('compression', [])
	.service('CompressionService', [function () {
		return {
			gzipStream: function (opts) {
				return zlib.createGzip(opts);
			}
		};
	}]);
