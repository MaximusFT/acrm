'use strict';

angular.module('mean.usermanager').config(['$stateProvider',
  function($stateProvider) {
    $stateProvider
	  .state('users manager page', {
      url: '/manager/users',
      templateUrl: 'usermanager/views/users.html'
    })
	  .state('user page', {
      url: '/manager/users/:userId',
      templateUrl: 'usermanager/views/user.html'
    });
  }
]);
