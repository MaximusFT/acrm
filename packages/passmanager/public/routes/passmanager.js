'use strict';

angular.module('mean.passmanager').config(['$stateProvider',
  function($stateProvider) {
    $stateProvider
	  .state('passwords manager page', {
      url: '/manager/passwords',
      templateUrl: 'passmanager/views/passes.html'
    })
	  .state('password manager page', {
      url: '/manager/passwords/:passId',
      templateUrl: 'passmanager/views/pass.html'
    });
  }
]);
