'use strict';

angular.module('mean.depmanager').config(['$stateProvider',
  function($stateProvider) {
    $stateProvider
	  .state('departments manager page', {
      url: '/manager/departments',
      templateUrl: 'depmanager/views/departments.html'
    })
	  .state('department manager page', {
      url: '/manager/departments/:departmentId',
      templateUrl: 'depmanager/views/department.html'
    });
  }
]);
