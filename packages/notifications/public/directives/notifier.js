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
                var infoLevel = true,
                    warningLevel = false,
                    dangerLevel = false;
                angular.forEach(notifications, function(notification) {
                    if (notification.event.level === 'warning' && !dangerLevel) {
                        infoLevel = false;
                        warningLevel = true;
                    }
                    if (notification.event.level === 'danger') {
                        infoLevel = false;
                        warningLevel = false;
                        dangerLevel = true;
                    }
                });
                //console.log(infoLevel, warningLevel, dangerLevel);
                if (dangerLevel)
                    $scope.dangerAlert.play();
                else if (warningLevel)
                    $scope.warningAlert.play();
                else
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

            $scope.setNotificationState = function(notification, state) {
                // NotificationSocket.emit('notification:setBookmark', {
                //     notification: notification._id,
                //     state: state
                // });
                if (state === 1) {
                    var catIndex = notification.event.category === 0 ? 2 : (notification.event.category === 1 ? 1 : (notification.event.category === 2 ? 0 : -1));
                    if (catIndex !== -1) {
                        console.log(catIndex);
                        console.log(angular.element('#notification-' + notification._id).addClass('removed-item'));
                        $timeout(function() {
                            angular.element('#notification-' + notification._id).remove();
                        }, 1000);
                    }
                } else if (state === 2) {
                    notification.state = state;
                }
            };

            NotificationSocket.on('connected', function() {
                $http.get('/api/clientId').success(function(response) {
                    $scope.clientId = response;
                    //help to identify client on server
                    NotificationSocket.emit('notifications:connect', {
                        userId: $scope.clientId,
                        userName: $scope.global.user.name
                    });

                    //listening for sygnal about new notifications
                    NotificationSocket.on('newNotification:' + $scope.clientId, function(notification) {
                        NotificationSocket.emit('notifications:get', $scope.clientId);
                    });

                    //listening of user notifications
                    console.log('notifications:init:' + $scope.clientId);
                    NotificationSocket.on('notifications:init:' + $scope.clientId, function(initPack) {
                        console.log('init notifications', initPack);
                        var rret = false;
                        angular.forEach(initPack.notifications, function(notification) {
                            var ret = false;
                            angular.forEach($scope.notifications, function(notif) {
                                if (notification._id === notif._id)
                                    ret = true;
                            });
                            if (ret === false) {
                                rret = true;
                                notification.time = notification.event.whenEmited;
                                $scope.notifications.push(notification);
                                $scope.unreadCount = initPack.unreadCount;
                                if (notification.state === 2)
                                    $scope.bookmarkedCount += 1;
                            }
                            if (rret === true)
                                $scope.playAlertSound(initPack.notifications);
                        });
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

        }
    };
});
