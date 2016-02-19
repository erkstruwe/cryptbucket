var blobToBuffer = require('blob-to-buffer');
var highland = require('highland');
var crypto = require('crypto');
var cipher = crypto.createCipheriv('aes-256-gcm', 'passwordpasswordpasswordpassword', crypto.randomBytes(12));
var cipherStream = crypto.createCipheriv('aes-256-ctr', 'passwordpasswordpasswordpassword', crypto.randomBytes(16));
var triplesec = require('triplesec');

require('ng-file-upload');

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

						console.log('unencrypted', buffer);

						//triplesec.encrypt({key: new Buffer('erk'), data: new Buffer(buffer)}, function (e, encrypted) {
						//	if (e)
						//		return console.error(e);
						//
						//	console.log('triplesec encrypted', encrypted);
						//
						//	return triplesec.decrypt({key: new Buffer('erk'), data: encrypted}, function (e, decrypted) {
						//		if (e)
						//			return console.error(e);
						//		return console.log('triplesec decrypted', decrypted);
						//	});
						//});

						//var encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
						//console.log('crypto buffer encrypted', encrypted, cipher.getAuthTag());

						// cipherStream output
						var output = new Buffer('');
						cipherStream.on('data', function (chunk) {
							//output = Buffer.concat([output, chunk]);
						});
						cipherStream.on('finish', function () {
							console.log('crypto stream encrypted', output);
						});

						// bufferStream
						var offset = 0;
						var chunkSize = 4096;
						var bufferStream = highland(function (push, next) {
							if (offset < buffer.length) {
								//console.log('sending slice');
								push(null, buffer.slice(offset, offset + chunkSize - 1));
								offset += chunkSize;
								setTimeout(next);
							} else {
								console.log('sending nil');
								push(null, highland.nil);
							}
						});
						bufferStream.pipe(cipherStream);
					});
				};
			}
		};
	}]);
