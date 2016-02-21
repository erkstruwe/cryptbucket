// external libraries

// external modules
require('ng-file-upload');

// components
require('../async/async.js');
require('../fileStream/fileStream.js');
require('../compression/compression.js');
require('../encryption/encryption.js');

angular
	.module('uploadForm', ['ngFileUpload', 'config', 'async', 'fileStream', 'compression', 'encryption'])
	.directive('uploadForm', ['Upload', 'CONFIG', 'async', 'FileStreamService', 'CompressionService', 'EncryptionService', function (Upload, CONFIG, async, FileStreamService, CompressionService, EncryptionService) {
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
					var fileStream = FileStreamService.readStream(scope.files[0], function (val) {
						scope.status.progress = val;
						scope.$apply();
					});

					var compressionStream = CompressionService.gzipStream({});

					return async.auto({
						cipherStream: function (cb) {
							return EncryptionService.cipherStream(scope.password, cb);
						},
						challenge: function (cb) {
							return cb(null, EncryptionService.randomBytes(256));
						},
						challengeResult: ['challenge', function (cb, r) {
							return EncryptionService.pbkdf2(scope.password, r.challenge, 32, cb);
						}],
						uploadPermission: ['cipherStream', 'challenge', 'challengeResult', function (cb, r) {
							console.log(r);
							scope.status.messages.push({text: 'password: not shown'});
							scope.status.messages.push({text: 'salt: ' + r.cipherStream.salt.toString('base64')});
							scope.status.messages.push({text: 'iv: ' + r.cipherStream.iv.toString('base64')});
							scope.status.messages.push({text: 'challenge: ' + r.challenge.toString('base64')});
							scope.status.messages.push({text: 'challengeResult: ' + r.challengeResult.toString('base64')});
							return cb();
						}],
						pipeline: ['cipherStream', 'uploadPermission', function (cb, r) {
							return fileStream.through(compressionStream).through(r.cipherStream.stream).done(cb);
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
