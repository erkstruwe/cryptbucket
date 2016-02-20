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

				scope.selectFiles = function ($files, $file, $newFiles, $duplicateFiles, $invalidFiles, $event) {
					console.log($files, $file, $newFiles, $duplicateFiles, $invalidFiles, $event);
				};

				scope.validate = function ($files) {
					return new Promise(function (resolve, reject) {
						// TODO check MD5 for copyrighted or illegal content
						return resolve(true);
					});
				};

				scope.upload = function () {
					// setup
					var fileStream = FileStreamService.readStream(scope.files[0]);
					var compressionStream = CompressionService.transformStream({});
					var cipherStream = EncryptionService.transformStream(scope.password);
					console.log('password', scope.password, ', iv', cipherStream.iv.toString('base64'));

					// start pipeline
					fileStream.through(compressionStream).through(cipherStream.stream).toArray(function (array) {
						return console.log(array);
					});
				};
			}
		};
	}]);
