require('ng-file-upload');
var blobToBuffer = require('blob-to-buffer');
var cipherStream = require('crypto').createCipher('aes192', 'password');

angular
	.module('uploadForm', ['ngFileUpload'])
	.directive('uploadForm', ['Upload', function (Upload) {
		return {
			templateUrl: config.baseUrlStatic + '/uploadForm.html',
			link: function (scope, element, attrs) {
				scope.file = null;

				scope.selectFile = function ($files, $file, $newFiles, $duplicateFiles, $invalidFiles, $event) {
					console.log($files, $file, $newFiles, $duplicateFiles, $invalidFiles, $event);
				};

				scope.upload = function () {
					return blobToBuffer(scope.file, function (e, buffer) {
						if (e)
							return console.error(e);
						return console.log(buffer);
					});
				};
			}
		};
	}]);
