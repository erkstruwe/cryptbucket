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
			templateUrl: CONFIG.baseUrlStatic + '/' + (CONFIG.assets['downloadForm.html'] || 'downloadForm.html'),
			scope: {
				uploadId: '@uploadId'
			},
			link: function (scope, element, attrs) {
				scope.password = '';
				scope.downloadedFile = null;
				scope.status = {
					downloadStreamProgress: {
						percentage: 0,
						speed: 0
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
							var downloadStream = requestProgress(request.get(r.downloadPermission.signedRequest), {throttle: 250});
							downloadStream.on('progress', function (state) {
								scope.status.downloadStreamProgress = state;
								scope.$apply();
							});

							var decompressionStream = CompressionService.gunzipStream({});

							return highland(downloadStream)
								.through(r.decipherStream)
								.through(decompressionStream)
								.pipe(blobStream())
								.on('finish', function () {
									scope.downloadedFile = {
										url: this.toBlobURL(),
										name: lodash.trimEnd('cryptbucket.' + lodash.get(r.downloadPermission, 'files.0.extension', ''), '.')
									};
									scope.status.downloadStreamProgress.percentage = 100;
									scope.$apply();
								});
						}]
					}, function (e, r) {
						if (e) {
							if (e.status == 404) {
								scope.form.password.$setValidity('correct', false);
								scope.form.$setPristine();
								return console.log('Wrong password');
							}
							return console.error(e);
						}

						return console.log(r);
					});
				};
			}
		};
	}]);
