// external libraries
var lodash = require('lodash');

// external modules

// components

angular
	.module('lodash', [])
	.service('lodash', [function () {
		return lodash;
	}]);
