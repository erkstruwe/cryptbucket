// external libraries
var jQuery = require('jquery');
angular = require('angular');
require('fastclick')(document.body);
//require('bootstrap/dist/js/umd/alert.js');
//require('angular-ng-bootstrap'); // (https://github.com/ng-bootstrap/core)

// external modules

// components
require('../uploadForm/uploadForm.js');

angular
	.module('cryptbucket', ['config', 'uploadForm'])
	.config(['CONFIG', '$sceDelegateProvider', function (CONFIG, $sceDelegateProvider) {
		$sceDelegateProvider.resourceUrlWhitelist([
			'self',
			'http:' + CONFIG.baseUrlStatic + '/**',
			'https:' + CONFIG.baseUrlStatic + '/**'
		]);
	}])
	.run(function () {
	});
