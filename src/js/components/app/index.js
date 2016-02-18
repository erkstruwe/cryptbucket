window.jQuery = require('jquery');
//require('bootstrap/dist/js/umd/alert.js');
var angular = require('angular');
require('ng-file-upload');
//require('angular-ng-bootstrap'); // (https://github.com/ng-bootstrap/core)

var app = angular.module('cryptbucket', []);

app.run(function () {
  console.log('Hello world');
});

