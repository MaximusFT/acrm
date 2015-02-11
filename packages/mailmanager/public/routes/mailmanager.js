'use strict';

angular.module('mean.mailmanager').config(['$stateProvider',
  function($stateProvider) {
    $stateProvider.state('mailmanager page', {
      url: '/mailmanager',
      templateUrl: 'mailmanager/views/index.html'
    });
    // .state('mailmanager example page2', {
    //   url: '/mailmanager',
    //   templateUrl: 'mailmanager/views/test.html'
    // });
  }
]);
