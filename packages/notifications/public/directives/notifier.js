'use strict';

angular.module('mean.notifications').directive('notifier', function(Global, NotificationSocket) {
    return {
        restrict: 'E',
        /*scope: {
            joinToChannel: '=',
            afterJoin: '&'
        },*/
        templateUrl: 'notifications/views/notifier.html',
        controller: function($scope, $element, $attrs, $timeout, $location, $http, $log) {
            $scope.global = Global;
            $scope.notificationBars = [{
                id: 'tasksBar',
                view: 'tasks',
                schema: 'danger',
                title: 'Tasks',
                icon: 'fa-tasks',
                notifications: [],
                unreadCount: 0,
                bookmarkedCount: 0
            }, {
                id: 'messagesBar',
                view: 'messages',
                schema: 'info',
                title: 'Messages',
                icon: 'fa-comments',
                notifications: [],
                unreadCount: 0,
                bookmarkedCount: 0
            }, {
                id: 'activitiesBar',
                view: 'activities',
                schema: 'warning',
                title: 'Activities',
                icon: 'fa-bell-o',
                notifications: [],
                unreadCount: 0,
                bookmarkedCount: 0
            }];

            $scope.getUnreadCount = function(notificationBar) {
                console.log('getUnreadCount');
                var count = 0;
                angular.forEach(notificationBar.notifications, function(notification) {
                    if (notification.state === 0)
                        count += 1;
                });
                return count;
            };

            NotificationSocket.on('connected', function() {
                $http.get('/api/clientId').success(function(response) {
                    $scope.clientId = response;
                    //help to identify client on server
                    NotificationSocket.emit('notifications:connect', $scope.clientId);

                    //listening for sygnal about new notifications
                    NotificationSocket.on('newNotification:' + $scope.clientId, function(notification) {
                        NotificationSocket.emit('notifications:get', $scope.clientId);
                    });

                    //listening of user notifications
                    NotificationSocket.on('notifications:init:' + $scope.clientId, function(notifications) {
                        console.log('init notifications', notifications);
                        angular.forEach(notifications, function(notification) {
                            var index = notification.category === 0 ? 2 : (notification.category === 1 ? 1 : (notification.category === 2 ? 0 : -1));
                            if (index !== -1) {
                                $scope.notificationBars[index].notifications.push(notification);
                                if (notification.state === 0)
                                    $scope.notificationBars[index].unreadCount += 1;
                                if (notification.state === 2)
                                    $scope.notificationBars[index].bookmarkedCount += 1;
                            }
                        });
                    });

                }).error(function(err, status) {
                    $log.error(err);
                    //$location.url('/error/' + status);
                });
            });

        }
    };
});
