// external libraries
var request = require('request');
var requestProgress = require('request-progress');
var highland = require('highland');

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
							return EncryptionService.pbkdf2(scope.password, r.upload.challenge, 255, cb);
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
							return EncryptionService.decipherStream(r.upload.salt, r.downloadPermission.iv, scope.password, cb);
						}],
						pipeline: ['downloadPermission', 'decipherStream', function (cb, r) {
							var downloadStream = highland(request.get(r.downloadPermission.signedRequest));

							var decompressionStream = CompressionService.gunzipStream({});

							console.log(123, r, downloadStream, decompressionStream);

							return downloadStream.through(r.decipherStream).through(decompressionStream).done(cb);
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
