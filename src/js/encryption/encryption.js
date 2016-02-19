// external libraries
var crypto = require('crypto');
//var triplesec = require('triplesec');

// external modules

// components

angular
	.module('encryption', [])
	.service('EncryptionService', [function () {
		return {
			transformStream: function (password) {
				// hash password with sha256 and truncate to get length of 32, this has no security implications
				var hash = crypto.createHash('sha256');
				hash.update(password);
				var passwordHash = hash.digest().slice(0, 32);

				// pseudo-random iv that will be publicly saved at cryptbucket
				var iv = crypto.randomBytes(16);

				return {
					stream: crypto.createCipheriv('aes-256-ctr', passwordHash, iv),
					iv: iv
				};
			}
		};
	}]);
