// external libraries
var zlib = require('zlib');

// external modules

// components

angular
	.module('compression', [])
	.service('CompressionService', [function () {
		return {
			transformStream: function (opts) {
				return zlib.createGzip(opts);
			}
		};
	}]);
