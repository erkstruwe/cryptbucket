// external libraries
var blobToBuffer = require('blob-to-buffer');
var highland = require('highland');

// external modules

// components
require('../lodash/lodash.js');

angular
	.module('fileStream', ['config'])
	.service('FileStreamService', ['CONFIG', function (CONFIG) {
		return {
			readStream: function (file) {
				// setup
				var offset = 0;
				var chunkSize = CONFIG.fileStream.chunkSize;

				return highland(function (push, next) {
					if (offset < file.size) {
						blobToBuffer(file.slice(offset, offset + chunkSize), function (e, buffer) {
							push(e, buffer);
							offset += chunkSize;
							next();
						});
					} else {
						push(null, highland.nil);
					}
				});
			}
		};
	}]);
