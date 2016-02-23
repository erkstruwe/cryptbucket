// external libraries
var highland = require('highland');
var request = require('request');

// external modules

// components

angular
	.module('s3', [])
	.service('S3Service', [function () {
		return {
			uploadStream: function (uri) {
				return highland.pipeline(function (stream) {
					var s3Stream = request({
						method: 'PUT',
						uri: uri,
						requestBodyStream: stream
					});
					console.log(s3Stream);
					return highland(s3Stream);
				});
			}
		};
	}]);
