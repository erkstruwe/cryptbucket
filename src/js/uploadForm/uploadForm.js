// external libraries
var request = require('request');

// external modules
require('ng-file-upload');

// components
require('../async/async.js');
require('../lodash/lodash.js');
require('../fileStream/fileStream.js');
require('../compression/compression.js');
require('../encryption/encryption.js');

angular
	.module('uploadForm', ['ngFileUpload', 'config', 'async', 'lodash', 'fileStream', 'compression', 'encryption'])
	.directive('uploadForm', ['Upload', 'CONFIG', 'async', 'lodash', 'FileStreamService', 'CompressionService', 'EncryptionService', '$http', function (Upload, CONFIG, async, lodash, FileStreamService, CompressionService, EncryptionService, $http) {
		return {
			templateUrl: CONFIG.baseUrlStatic + '/uploadForm.html',
			link: function (scope, element, attrs) {
				scope.files = [];
				scope.invalidFiles = [];
				scope.password = '';
				scope.validation = CONFIG.uploadForm.validation;
				scope.status = {
					progress: 0,
					messages: []
				};

				scope.selectFiles = function ($files, $file, $newFiles, $duplicateFiles, $invalidFiles, $event) {
					console.log($files, $file, $newFiles, $duplicateFiles, $invalidFiles, $event);
					if ($newFiles) {
						$newFiles.forEach(function (file) {
							scope.status.messages.push({text: 'Selected ' + (file.$error ? 'invalid (' + file.$error + ')' : 'valid') + ' file ' + file.name + ', ' + file.size + ' bytes'});
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
					return async.auto({
						cipherStream: function (cb) {
							return EncryptionService.cipherStream(scope.password, cb);
						},
						challenge: function (cb) {
							return cb(null, EncryptionService.randomBytes(255));
						},
						challengeResult: ['challenge', function (cb, r) {
							return EncryptionService.pbkdf2(scope.password, r.challenge, 255, cb);
						}],
						uploadPermission: ['cipherStream', 'challenge', 'challengeResult', function (cb, r) {
							console.log(r);
							scope.status.messages.push({text: 'password: not shown'});
							scope.status.messages.push({text: 'salt: ' + r.cipherStream.salt.toString('base64')});
							scope.status.messages.push({text: 'iv: ' + r.cipherStream.iv.toString('base64')});
							scope.status.messages.push({text: 'challenge: ' + r.challenge.toString('base64')});
							scope.status.messages.push({text: 'challengeResult: ' + r.challengeResult.toString('base64')});

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
									console.log(response);
									return cb(null, response.data);
								})
								.catch(function (e) {
									console.error(e);
									return cb(e);
								});
						}],
						pipeline: ['cipherStream', 'uploadPermission', function (cb, r) {
							var fileStream = FileStreamService.readStream(scope.files[0], function (val) {
								scope.status.progress = val;
								scope.$apply();
							});

							var compressionStream = CompressionService.gzipStream({});

							var s3Stream = request
								.put({
									method: 'PUT',
									url: r.uploadPermission.signedRequest,
									headers: {
										'content-type': 'application/octet-stream'
									}
								})
								.on('error', cb)
								.on('end', cb);

							// hack to convince request/helpers/isReadStream that this is in fact a readable stream
							var pipeline = fileStream.through(compressionStream).pipe(r.cipherStream.stream);
							pipeline.path = 'cryptbucket.bin';
							pipeline.mode = true;
							pipeline.pipe(s3Stream);
						}],
						uploaded: ['uploadPermission', 'pipeline', function (cb, r) {
							console.log(r.uploadPermission);
							return $http({
								method: 'PUT',
								url: CONFIG.baseUrl + '/api/upload/' + r.uploadPermission.upload.id + '/uploaded',
								data: {
									challengeResult: r.challengeResult.toString('binary')
								}
							})
								.then(function (response) {
									console.log(response);
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

						console.log(r);
						return scope.status.messages.push({text: 'done'});
					});
				};
			}
		};
	}]);
