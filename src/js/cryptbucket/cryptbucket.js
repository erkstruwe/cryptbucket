// external libraries
var jQuery = require('jquery');
angular = require('angular');
require('fastclick')(document.body);
//require('bootstrap/dist/js/umd/alert.js');
//require('angular-ng-bootstrap'); // (https://github.com/ng-bootstrap/core)

// external modules

// components
require('../uploadForm/uploadForm.js');
require('../downloadForm/downloadForm.js');

angular
	.module('cryptbucket', ['config', 'uploadForm', 'downloadForm'])
	.config(['CONFIG', '$sceDelegateProvider', function (CONFIG, $sceDelegateProvider) {
		$sceDelegateProvider.resourceUrlWhitelist([
			'self',
			'http:' + CONFIG.baseUrlStatic + '/**',
			'https:' + CONFIG.baseUrlStatic + '/**'
		]);
	}])
	.run(function () {
	});
