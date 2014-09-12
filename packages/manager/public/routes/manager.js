'use strict';

angular.module('mean.manager').config(['$stateProvider',
  function($stateProvider) {
    $stateProvider.state('manager example page', {
      url: '/manager',
      templateUrl: 'manager/views/index.html'
    })
	  .state('manager passes page', {
      url: '/manager/passes',
      templateUrl: 'manager/views/passes.html'
    })
	  .state('manager users page', {
      url: '/manager/users',
      templateUrl: 'manager/views/users.html'
    })
	  .state('manager pass page', {
      url: '/manager/passes/:passId',
      templateUrl: 'manager/views/pass.html'
    })
	  .state('manager user page', {
      url: '/manager/users/:userId',
      templateUrl: 'manager/views/user.html'
    });
  }
]);
