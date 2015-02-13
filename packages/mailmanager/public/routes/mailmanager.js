'use strict';

angular.module('mean.mailmanager').config(['$stateProvider',
    function($stateProvider) {
        $stateProvider.state('mailmanager', {
            url: '/mailmanager',
            templateUrl: 'mailmanager/views/index.html'
        });
    }
]);
