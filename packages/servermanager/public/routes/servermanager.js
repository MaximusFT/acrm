'use strict';

angular.module('mean.servermanager').config(['$stateProvider',
    function($stateProvider) {
        $stateProvider.state('servers', {
            url: '/servers',
            templateUrl: 'servermanager/views/index.html'
        });
    }
]);
