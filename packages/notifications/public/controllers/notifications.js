'use strict';

angular.module('mean.usermanager').controller('NotificationsController', ['$scope', '$location', '$http', '$log', '$timeout', 'modalService', 'Global', 'ScrollTo',
    function($scope, $location, $http, $log, $timeout, modalService, Global, ScrollTo) {
        $scope.global = Global;

        $scope.initNGroups = function() {
            $scope.getHttp2 = $http.get('/api/notificationGroups').success(function(response) {
                $scope.notificationGroups = response;
            }).error(function(err, status) {
                $log.error(err);
                $location.url('/errors/' + status);
            });
        };

        $scope.addNotificationGroup = function(nGroup) {
            $http.post('/api/notificationGroup', nGroup).success(function(response) {
                $scope.initNGroups();
            }).error(function(err, status) {
                $log.error(err);
                $location.url('/errors/' + status);
            });
        };

        $scope.updateNotificationGroup = function(nGroup, field, index, field2) {
            //$log.info(nGroup, field);
            if (field !== 'settings')
                $http.put('/api/notificationGroup/' + nGroup._id, {
                    key: field,
                    val: nGroup[field]
                }).success(function(response) {
                    //$log.info(response);
                }).error(function(err, status) {
                    $log.error(err);
                    $location.url('/errors/' + status);
                });
            if (field === 'settings') {
                $http.post('/api/notificationSettings', {
                    params: {
                        nGroup: nGroup._id,
                        nSetting: nGroup.settings[index]._id ? nGroup.settings[index]._id : -1,
                        key: field2,
                        val: nGroup.settings[index][field2]
                    }
                }).success(function(response) {
                    //$log.info(response);
                    $scope.initNSettings(nGroup);
                }).error(function(err, status) {
                    $log.error(err);
                    $location.url('/errors/' + status);
                });
            }
        };

        $scope.showAssignedToNGroup = function(nGroup) {
            $scope.selectedNGroup = nGroup;
            $http.get('/api/notificationGroup/' + nGroup._id).success(function(response) {
                //$log.info(response);
                $scope.notificationGroupUsers = response;
                $timeout(function() {
                    ScrollTo.idOrName('usersInGroupAncor');
                }, 500);
            }).error(function(err, status) {
                $log.error(err);
                $location.url('/errors/' + status);
            });
        };

        $scope.assignToNotificationGroup = function(nGroup) {
            var modalOptions = {
                closeButtonText: 'Cancel',
                actionButtonText: 'Confirm',
                headerText: 'Choose person(s)',
                bodyText: 'Specify what employee you want to assign new responsibility.',
                type: 1
            };

            modalService.showModal({}, modalOptions).then(function(result) {
                $http.post('/api/notificationGroup/' + nGroup._id, {
                    users: result
                }).success(function(response) {
                    $scope.showAssignedToNGroup(nGroup);
                }).error(function(err, status) {
                    $log.error(err);
                    $location.url('/errors/' + status);
                });
            });
        };

        $scope.removeNotificationGroup = function(nGroup) {
            if (window.confirm('Are you shure?')) {
                $http.delete('/api/notificationGroup/' + nGroup._id).success(function(response) {
                    $scope.initNGroups();
                }).error(function(err, status) {
                    $log.error(err);
                    $location.url('/errors/' + status);
                });
            }
        };

        $scope.addNotificationSetting = function(nGroup) {
            if (!nGroup.settings)
                nGroup.settings = [];
            nGroup.settings.push({});
        };

        $scope.removeNSetting = function(nGroup, index) {
            nGroup.settings.splice(index, 1);
            $scope.updateNotificationGroup(nGroup, 'settings');
            $scope.initNGroups();
        };

        $scope.initNSettings = function(nGroup) {
            $http.get('/api/notificationSettings/' + nGroup._id).success(function(response) {
                //$log.info(response);
                nGroup.settings = response;
            }).error(function(err, status) {
                $log.error(err);
                $location.url('/errors/' + status);
            });
        };

        $scope.initUserSettings = function() {
            $http.get('/api/userNotificationsSettings').success(function(response) {
                //$log.info(response);
                $scope.nSettings = response;
            }).error(function(err, status) {
                $log.error(err);
                $location.url('/errors/' + status);
            });
        };

        $scope.onSettingChanged = function(setting) {
            //$log.info(setting);
            $http.post('/api/setUserNotificationSetting', {
                params: {
                    setting: setting._id,
                    userOption: setting.value
                }
            }).success(function(response) {
                //$log.info(response);
            }).error(function(err, status) {
                $log.error(err);
                $location.url('/errors/' + status);
            });
        };

    }
]);
