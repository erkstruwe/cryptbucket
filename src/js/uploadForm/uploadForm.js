// external libraries

// external modules
require('ng-file-upload');

// components
require('../fileStream/fileStream.js');
require('../compression/compression.js');
require('../encryption/encryption.js');

angular
	.module('uploadForm', ['ngFileUpload', 'config', 'fileStream', 'compression', 'encryption'])
	.directive('uploadForm', ['Upload', 'CONFIG', 'FileStreamService', 'CompressionService', 'EncryptionService', function (Upload, CONFIG, FileStreamService, CompressionService, EncryptionService) {
		return {
			templateUrl: CONFIG.baseUrlStatic + '/uploadForm.html',
			link: function (scope, element, attrs) {
				scope.files = [];
				scope.invalidFiles = [];
				scope.password = 'secret';
				scope.validation = CONFIG.uploadForm.validation;
				scope.status = {
					progress: 0,
					messages: []
				};

				scope.selectFiles = function ($files, $file, $newFiles, $duplicateFiles, $invalidFiles, $event) {
					scope.status.messages.push({text: 'Selected file ' + $file.name + ', ' + $file.size + ' bytes'});
					console.log($files, $file, $newFiles, $duplicateFiles, $invalidFiles, $event);
				};

				scope.validate = function ($files) {
					return new Promise(function (resolve, reject) {
						// TODO check MD5 for copyrighted or illegal content
						return resolve(true);
					});
				};

				scope.process = function () {
					// setup
					var fileStream = FileStreamService.readStream(scope.files[0], function (val) {
						scope.status.progress = val;
						scope.$apply();
					});
					var compressionStream = CompressionService.transformStream({});
					var cipherStream = EncryptionService.transformStream(scope.password);

					scope.status.messages.push({text: 'password: ' + scope.password + ', iv: ' + cipherStream.iv.toString('base64')});

					// start pipeline
					return fileStream.through(compressionStream).through(cipherStream.stream).toArray(function (array) {
						return scope.status.messages.push({text: 'done'});
					});
				};
			}
		};
	}]);
