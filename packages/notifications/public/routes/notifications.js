'use strict';

angular.module('mean.notifications').config(['$stateProvider',
    function($stateProvider) {
        $stateProvider.state('notification groups', {
            url: '/notifications/groups',
            templateUrl: 'notifications/views/notificationGroups.html'
        }).state('notifications settings', {
        	url: '/users/:username/notifications-settings',
        	templateUrl: 'notifications/views/notificationsSettings.html'
        });
    }
]);
