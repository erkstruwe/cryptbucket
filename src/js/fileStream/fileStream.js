// external libraries
var blobToBuffer = require('blob-to-buffer');
var highland = require('highland');

// external modules

// components

angular
	.module('fileStream', [])
	.service('FileStreamService', [function () {
		return {
			readStream: function (file) {
				// setup
				var offset = 0;
				var chunkSize = config.fileStream.chunkSize;

				console.log(file);

				return highland(function (push, next) {
					if (offset < file.size) {
						blobToBuffer(file.slice(offset, offset + chunkSize - 1), function (e, buffer) {
							push(e, buffer);
							offset += chunkSize;
							console.log(offset);
							next();
						});
					} else {
						console.log('sending nil');
						push(null, highland.nil);
					}
				});
			}
		};
	}]);
