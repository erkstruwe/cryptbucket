// external libraries
var blobToBuffer = require('blob-to-buffer');
var highland = require('highland');

// external modules

// components
require('../lodash/lodash.js');

angular
	.module('fileStream', ['config', 'lodash'])
	.service('FileStreamService', ['CONFIG', 'lodash', function (CONFIG, lodash) {
		return {
			readStream: function (file, progress) {
				// setup
				var throttledProgress = lodash.throttle(progress, 250);
				var offset = 0;
				var chunkSize = CONFIG.fileStream.chunkSize;

				console.log(file);

				return highland(function (push, next) {
					if (offset < file.size) {
						blobToBuffer(file.slice(offset, offset + chunkSize - 1), function (e, buffer) {
							push(e, buffer);
							offset += chunkSize;
							throttledProgress(lodash.min([offset / file.size, 1]));
							next();
						});
					} else {
						push(null, highland.nil);
					}
				});
			}
		};
	}]);
