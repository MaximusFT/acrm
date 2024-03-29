'use strict';

angular.module('mean.chatmanager').config(['$stateProvider',
    function($stateProvider) {
        $stateProvider.state('chatmanager page', {
            url: '/manager/chat',
            templateUrl: 'chatmanager/views/index.html'
        }).state('private history', {
            url: '/manager/chat/history',
            templateUrl: 'chatmanager/views/history.html'
        });
    }
]);
