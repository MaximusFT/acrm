'use strict';

angular.module('mean.support').config(['$stateProvider',
  function($stateProvider) {
    $stateProvider.state('support page', {
      url: '/support',
      templateUrl: 'support/views/index.html'
    });
  }
]);
