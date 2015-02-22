'use strict';

angular.module('mean.depmanager').config(['$stateProvider',
  function($stateProvider) {
    $stateProvider
	  .state('departments', {
      url: '/departments',
      templateUrl: 'depmanager/views/departments.html'
    })
	  .state('department', {
      url: '/departments/:departmentId',
      templateUrl: 'depmanager/views/departments.html'
    });
  }
]);
