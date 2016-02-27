// external libraries
var request = require('request');
var requestProgress = require('request-progress');
var highland = require('highland');
var blobStream = require('blob-stream');

// external modules

// components
require('../async/async.js');
require('../lodash/lodash.js');
require('../compression/compression.js');
require('../encryption/encryption.js');

angular
	.module('downloadForm', ['config', 'async', 'lodash', 'compression', 'encryption'])
	.directive('downloadForm', ['CONFIG', 'async', 'lodash', 'CompressionService', 'EncryptionService', '$http', function (CONFIG, async, lodash, CompressionService, EncryptionService, $http) {
		return {
			templateUrl: CONFIG.baseUrlStatic + '/downloadForm.html',
			scope: {
				uploadId: '@uploadId'
			},
			link: function (scope, element, attrs) {
				scope.password = '';
				scope.downloadedFile = null;
				scope.status = {
					downloadStreamProgress: {
						percentage: 0
					},
					decipherStreamProgress: {
						percentage: 0
					}
				};

				scope.process = function () {
					return async.auto({
						upload: function (cb) {
							return $http({
								method: 'GET',
								url: CONFIG.baseUrl + '/api/upload/' + scope.uploadId
							})
								.then(function (response) {
									return cb(null, response.data);
								})
								.catch(function (error) {
									return cb(error);
								});
						},
						challengeResult: ['upload', function (cb, r) {
							return EncryptionService.pbkdf2(scope.password, new Buffer(r.upload.challenge, 'binary'), 255, cb);
						}],
						downloadPermission: ['challengeResult', function (cb, r) {
							return $http({
								method: 'GET',
								url: CONFIG.baseUrl + '/api/upload/' + scope.uploadId + '/downloadPermission',
								params: {
									challengeResult: r.challengeResult.toString('binary')
								}
							})
								.then(function (response) {
									return cb(null, response.data);
								})
								.catch(function (error) {
									return cb(error);
								});
						}],
						decipherStream: ['upload', 'downloadPermission', function (cb, r) {
							return EncryptionService.decipherStream(new Buffer(r.upload.salt, 'binary'), new Buffer(r.downloadPermission.iv, 'binary'), scope.password, cb);
						}],
						pipeline: ['downloadPermission', 'decipherStream', function (cb, r) {
							var downloadStream = highland(request.get(r.downloadPermission.signedRequest));

							var decompressionStream = CompressionService.gunzipStream({});

							return downloadStream
								.through(r.decipherStream)
								.through(decompressionStream)
								.pipe(blobStream())
								.on('finish', function () {
									scope.downloadedFile = this.toBlobURL();
									scope.$apply();
								});
						}]
					}, function (e, r) {
						if (e)
							return console.error(e);

						return console.log(r);
					});
				};
			}
		};
	}]);