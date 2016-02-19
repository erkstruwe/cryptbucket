// external libraries

// external modules
require('ng-file-upload');

// components
require('../fileStream/fileStream.js');
require('../compression/compression.js');
require('../encryption/encryption.js');

angular
	.module('uploadForm', ['ngFileUpload', 'fileStream', 'compression', 'encryption'])
	.directive('uploadForm', ['Upload', 'FileStreamService', 'CompressionService', 'EncryptionService', function (Upload, FileStreamService, CompressionService, EncryptionService) {
		return {
			templateUrl: config.baseUrlStatic + '/uploadForm.html',
			link: function (scope, element, attrs) {
				scope.file = null;
				scope.password = 'secret';

				scope.selectFile = function ($files, $file, $newFiles, $duplicateFiles, $invalidFiles, $event) {
					console.log($files, $file, $newFiles, $duplicateFiles, $invalidFiles, $event);
				};

				scope.upload = function () {
					// setup
					var fileStream = FileStreamService.readStream(scope.file);
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
