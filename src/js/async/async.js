// external libraries
var async = require('async');
// external modules

// components

angular
	.module('async', [])
	.service('async', [function () {
		return async;
	}]);
