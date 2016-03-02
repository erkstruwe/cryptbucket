// external libraries
jQuery = require('jquery');
angular = require('angular');
Tether = require('tether');
require('bootstrap');
require('fastclick')(document.body);
//require('bootstrap/dist/js/umd/alert.js');
//require('angular-ng-bootstrap'); // (https://github.com/ng-bootstrap/core)

// external modules
require('angular-scroll');

// components
require('../uploadForm/uploadForm.js');
require('../downloadForm/downloadForm.js');

angular
	.module('cryptbucket', ['config', 'duScroll', 'uploadForm', 'downloadForm'])
	.config(['CONFIG', '$sceDelegateProvider', function (CONFIG, $sceDelegateProvider) {
		$sceDelegateProvider.resourceUrlWhitelist([
			'self',
			CONFIG.baseUrlStatic + '/**',
			CONFIG.baseUrlStatic + '/**'
		]);
	}])
	.run(function () {
	});
