// external libraries
var highland = require('highland');
var progressStream = require('progress-stream');
var blobStream = require('blob-stream');

// external modules
require('ng-file-upload');
require('angular-clipboard');

// components
require('../async/async.js');
require('../lodash/lodash.js');
require('../fileStream/fileStream.js');
require('../compression/compression.js');
require('../encryption/encryption.js');

angular
	.module('uploadForm', ['ngFileUpload', 'angular-clipboard', 'config', 'async', 'lodash', 'fileStream', 'compression', 'encryption'])
	.directive('uploadForm', ['Upload', 'CONFIG', 'async', 'lodash', 'FileStreamService', 'CompressionService', 'EncryptionService', '$http', function (Upload, CONFIG, async, lodash, FileStreamService, CompressionService, EncryptionService, $http) {
		return {
			templateUrl: CONFIG.baseUrlStatic + '/uploadForm.html',
			scope: {
				file: [],
				invalidFiles: [],
				password: '',
				validation: CONFIG.uploadForm.validation,
				uploadedFile: null,
				status: {
					cipherStreamProgress: {
						percentage: 0
					},
					uploadProgress: {
						percentage: 0
					}
				}
			},
			link: function (scope, element, attrs) {
				scope.selectFiles = function ($files, $file, $newFiles, $duplicateFiles, $invalidFiles, $event) {
					console.log($files, $file, $newFiles, $duplicateFiles, $invalidFiles, $event);
					if ($newFiles) {
						$newFiles.forEach(function (file) {
							console.log('Selected ' + (file.$error ? 'invalid (' + file.$error + ')' : 'valid') + ' file ' + file.name + ', ' + file.size + ' bytes');
						});
					}
					scope.files = $files;
				};

				scope.validate = function ($files) {
					return new Promise(function (resolve, reject) {
						// TODO check MD5 for copyrighted or illegal content
						return resolve(true);
					});
				};

				scope.process = function () {
					scope.uploadedFile = null;
					return async.auto({
						cipherStream: function (cb) {
							console.log('Preparing encryption');
							return EncryptionService.cipherStream(scope.password, cb);
						},
						challenge: function (cb) {
							return cb(null, EncryptionService.randomBytes(255));
						},
						challengeResult: ['challenge', function (cb, r) {
							return EncryptionService.pbkdf2(scope.password, r.challenge, 255, cb);
						}],
						uploadPermission: ['cipherStream', 'challenge', 'challengeResult', function (cb, r) {
							console.log('Requesting upload permission');
							return $http({
								method: 'POST',
								url: CONFIG.baseUrl + '/api/upload/',
								data: {
									salt: r.cipherStream.salt.toString('binary'),
									iv: r.cipherStream.iv.toString('binary'),
									challenge: r.challenge.toString('binary'),
									challengeResult: r.challengeResult.toString('binary'),
									files: lodash.chain(scope.files)
										.map(function (file) {
											return {
												size: file.size,
												type: file.type || null
											};
										})
										.value()
								}
							})
								.then(function (response) {
									return cb(null, response.data);
								})
								.catch(function (e) {
									console.error(e);
									return cb(e);
								});
						}],
						pipeline: ['cipherStream', 'uploadPermission', function (cb, r) {
							var fileStream = FileStreamService.readStream(scope.files[0]);

							var compressionStream = CompressionService.gzipStream({});

							var cipherStreamProgress = progressStream({
								length: scope.files[0].size,
								time: 250
							});
							cipherStreamProgress.on('progress', function (progress) {
								scope.status.cipherStreamProgress = progress;
								scope.$apply();
							});

							console.log('Encrypting');

							return fileStream.through(compressionStream).through(r.cipherStream.stream).through(cipherStreamProgress).pipe(blobStream()).on('finish', function () {
								var blob = this.toBlob();

								console.log('Uploading');

								return Upload.http({
									method: 'PUT',
									url: r.uploadPermission.signedRequest,
									data: blob
								})
									.then(function (response) {
										return cb(null, response);
									}, function (e) {
										console.error(e);
										return cb(e);
									}, function (evt) {
										scope.status.uploadProgress.percentage = evt.loaded / evt.total * 100;
									});
							});
						}],
						uploaded: ['uploadPermission', 'pipeline', function (cb, r) {
							console.log('Finalizing upload');

							return $http({
								method: 'PUT',
								url: CONFIG.baseUrl + '/api/upload/' + r.uploadPermission.upload.id + '/uploaded',
								data: {
									challengeResult: r.challengeResult.toString('binary')
								}
							})
								.then(function (response) {
									return cb(null, response.data);
								})
								.catch(function (e) {
									console.error(e);
									return cb(e);
								});
						}]
					}, function (e, r) {
						if (e)
							return console.error(e);

						console.log('Done', r);
						scope.uploadedFile = CONFIG.baseUrl + '/download/' + r.uploadPermission.upload.id;
						return scope.$apply();
					});
				};
			}
		};
	}]);
