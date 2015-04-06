'use strict';

angular.module('mean.notifications').directive('notifier', function(Global, NotificationSocket) {
    return {
        restrict: 'E',
        /*scope: {
            joinToChannel: '=',
            afterJoin: '&'
        },*/
        templateUrl: 'notifications/views/notifier.html',
        controller: function($scope, $element, $attrs, $timeout, $location, $http) {
            $scope.global = Global;
            $scope.notificationBars = [{
                id: 'messagesBar',
                view: 'messages',
                schema: 'info',
                title: 'Messages',
                icon: 'fa-comments',
                eventsCount: 0
            }, {
                id: 'activitiesBar',
                view: 'activities',
                schema: 'warning',
                title: 'Activities',
                icon: 'fa-bell-o',
                eventsCount: 0
            }, {
                id: 'tasksBar',
                view: 'tasks',
                schema: 'danger',
                title: 'Tasks',
                icon: 'fa-tasks',
                eventsCount: 0
            }];

            $http.post('/api/mode').success(function(response) {
                if (response === 777)
                    NotificationSocket.on('notification:admins', function(event) {
                        console.log('admins event', event);
                    });
                else
                    NotificationSocket.on('notifications:users', function(event) {
                        console.log('users event', event);
                    });
            });

            NotificationSocket.on('connected', function() {
                console.log('emited: notifications:on', $scope.global.user);
                NotificationSocket.emit('notifications:on', $scope.global.user);
            });

            NotificationSocket.on('notifications:init:' + $scope.global.user._id, function(events) {
                console.log('init notifications', events);
            });

            NotificationSocket.on('notification:' + $scope.global.user._id, function(event) {
                console.log('personal event', event);
            });
        }
    };
});
