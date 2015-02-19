'use strict';

angular.module('mean.servermanager').config(['$stateProvider',
    function($stateProvider) {
        $stateProvider.state('servers', {
            url: '/servers',
            templateUrl: 'servermanager/views/index.html'
        }).state('server', {
            url: '/servers/:serverId',
            templateUrl: 'servermanager/views/index.html'
        }).state('site', {
            url: '/servers/site/:siteId',
            templateUrl: 'servermanager/views/site.html'
        });
    }
]);
