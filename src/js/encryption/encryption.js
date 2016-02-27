// external libraries
var crypto = require('crypto');
var highland = require('highland');

// external modules

// components

angular
	.module('encryption', ['config'])
	.service('EncryptionService', ['CONFIG', function (CONFIG) {
		var pbkdf2 = function (password, salt, keylen, cb) {
			return crypto.pbkdf2(password, salt, CONFIG.encryption.pbkdf2.iterations, keylen, CONFIG.encryption.pbkdf2.digest, cb);
		};

		var randomBytes = crypto.randomBytes;

		var cipherStream = function (password, cb) {
			var salt = crypto.randomBytes(255);
			var iv = crypto.randomBytes(16);
			return pbkdf2(password, salt, 32, function (e, key) {
				if (e)
					return cb(e);

				return cb(null, {
					stream: crypto.createCipheriv('aes-256-ctr', key, iv),
					salt: salt,
					iv: iv
				});
			});
		};

		var decipherStream = function (salt, iv, password, cb) {
			return pbkdf2(password, salt, 32, function (e, key) {
				if (e)
					return cb(e);

				return cb(null, crypto.createDecipheriv('aes-256-ctr', key, iv));
			});
		};

		return {
			pbkdf2: pbkdf2,
			randomBytes: randomBytes,
			cipherStream: cipherStream,
			decipherStream: decipherStream
		};
	}]);
