// external libraries
var jQuery = require('jquery');
var angular = require('angular');
require('fastclick')(document.body);
//require('bootstrap/dist/js/umd/alert.js');
//require('angular-ng-bootstrap'); // (https://github.com/ng-bootstrap/core)

// external modules

// components
require('../uploadForm/uploadForm.js');

angular
	.module('cryptbucket', ['uploadForm'])
	.config(['$sceDelegateProvider', function ($sceDelegateProvider) {
		$sceDelegateProvider.resourceUrlWhitelist([
			'self',
			'http:' + config.baseUrlStatic + '/**',
			'https:' + config.baseUrlStatic + '/**'
		]);
	}])
	.run(function () {
	});
