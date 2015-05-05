'use strict';

angular.module('mean.notifications').directive('notifier', function(Global, NotificationSocket) {
    return {
        restrict: 'E',
        /*scope: {
            joinToChannel: '=',
            afterJoin: '&'
        },*/
        templateUrl: 'notifications/views/notifier.html',
        controller: function($scope, $element, $attrs, $timeout, $location, $http, $log, ngAudio) {
            $scope.global = Global;
            $scope.infoAlert = ngAudio.load('//mapqo.com/atlant/audio/warning.mp3');
            $scope.warningAlert = ngAudio.load('//mapqo.com/atlant/audio/danger.mp3');
            $scope.dangerAlert = ngAudio.load('//mapqo.com/atlant/audio/fail.mp3');
            $scope.notifications = [];

            $scope.playAlertSound = function(notifications) {
                var infoLevel = false,
                    warningLevel = false,
                    dangerLevel = false;
                angular.forEach(notifications, function(notification) {
                    if (notification.state === 0 || notification.state === 2) {
                        if (notification.event.level === 'info' && !warningLevel && !dangerLevel)
                            infoLevel = true;
                        if (notification.event.level === 'warning' && !dangerLevel) {
                            infoLevel = false;
                            warningLevel = true;
                        }
                        if (notification.event.level === 'danger') {
                            infoLevel = false;
                            warningLevel = false;
                            dangerLevel = true;
                        }
                    }
                });
                // console.log(infoLevel, warningLevel, dangerLevel);
                if (dangerLevel)
                    $scope.dangerAlert.play();
                else if (warningLevel)
                    $scope.warningAlert.play();
                else if (infoLevel)
                    $scope.infoAlert.play();
            };

            $scope.formatDate = function(date) {
                return new Date(date).toLocaleString();
            };

            $scope.openNotificationsBar = function(event) {
                var isActive = angular.element('#' + event.currentTarget.id).parent().hasClass('active');
                angular.element('.xn-icon-button').removeClass('active');
                if (!isActive) {
                    angular.element('#' + event.currentTarget.id).parent().addClass('active');
                    $scope.html_click_avail = true;
                }
            };

            function sortNotifications(a, b) {
                return a.state !== 2 && b.state === 2 ? 1 : 
                    (a.state === 2 && b.state !== 2 ? -1 : 
                        (a.state !== 1 && b.state === 1 ? -1 : 
                            (a.state === 1 && b.state !== 1 ? 1 : 
                                (a.event.whenEmited > b.event.whenEmited ? -1 : 
                                    (a.event.whenEmited < b.event.whenEmited ? 1 : 0)
                                )
                            )
                        )
                    );
            }

            function updateUnreadCount() {
                $http.post('/api/generalUnreadNotifications').success(function(response) {
                    $scope.unreadCount = response;
                }).error(function(err, status) {
                    $log.error(err);
                });
            }

            $scope.setNotificationState = function(notification, state) {
                NotificationSocket.emit('notification:setBookmark', {
                    notification: notification._id,
                    state: state
                });
                notification.state = state;
                $scope.notifications.sort(sortNotifications);
                updateUnreadCount();
            };

            function getNotificationsForUser() {
                $http.post('/api/notificationsForUser').success(function(response) {
                    $scope.unreadCount = response.unreadCount;
                    var rret = false;
                    angular.forEach(response.notifications, function(notification) {
                        var ret = false;
                        angular.forEach($scope.notifications, function(notif) {
                            if (notification._id === notif._id)
                                ret = true;
                        });
                        if (ret === false) {
                            rret = true;
                            $scope.notifications.push(notification);
                            if (notification.state === 2)
                                $scope.bookmarkedCount += 1;
                        }
                        if (rret === true)
                            $scope.playAlertSound(response.notifications);
                    });
                }).error(function(err, status) {
                    $log.error(err);
                });
            }

            NotificationSocket.on('connected', function() {
                console.log('connection with notification server was established');
                $http.get('/api/clientId').success(function(response) {
                    $scope.clientId = response;
                    //help to identify client on server
                    NotificationSocket.emit('notifications:connect', {
                        userId: $scope.clientId,
                        userName: $scope.global.user.name
                    });

                    //listening for sygnal about new notifications
                    NotificationSocket.on('newNotification:' + $scope.clientId, function(notification) {
                        //NotificationSocket.emit('notifications:get', $scope.clientId);
                        getNotificationsForUser();
                    });

                    //listening of user notifications
                    NotificationSocket.on('notifications:init', function() {
                        getNotificationsForUser();
                    });
                }).error(function(err, status) {
                    $log.error(err);
                    //$location.url('/error/' + status);
                });
            });

            $scope.isInformer = function(index) {
                // notifications
                if (index === 3) {
                    var ret = false;
                    angular.forEach($scope.notifications, function(notification) {
                        if (notification.state === 0 || notification.state === 2)
                            ret = true;
                    });
                    return ret;
                }
            };

            $scope.getInformer = function(index) {
                // notifications
                if (index === 3) {
                    var unread = 0,
                        bookmarked = 0;
                    angular.forEach($scope.notifications, function(notification) {
                        if (notification.state === 0)
                            unread += 1;
                        if (notification.state === 2)
                            bookmarked += 1;
                    });
                    return {
                        unread: unread,
                        bookmarked: bookmarked
                    };
                }
            };

            $scope.$watchCollection('notifications', function(newVal, oldVal) {
                $scope.notifications.sort(sortNotifications);
                updateUnreadCount();
            });

        }
    };
});
