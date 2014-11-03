'use strict';

angular.module('mean.clients').config(['$stateProvider',
  function($stateProvider) {
    $stateProvider.state('clients manager page', {
      url: '/clients/example',
      templateUrl: 'clients/views/index.html'
    });
  }
]);
