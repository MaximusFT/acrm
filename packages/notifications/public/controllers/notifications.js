'use strict';

angular.module('mean.usermanager').controller('NotificationsController', ['$scope', '$location', '$http', '$log', 'modalService', 'Global',
    function($scope, $location, $http, $log, modalService, Global) {
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

        $scope.updateNotificationGroup = function(nGroup, field) {
            $http.put('/api/notificationGroup/' + nGroup._id, {
                key: field,
                val: nGroup[field]
            }).success(function(response) {
                $log.info(response);
            }).error(function(err, status) {
                $log.error(err);
                $location.url('/errors/' + status);
            });
        };

        $scope.showAssignedToNGroup = function(nGroup) {
            $scope.selectedNGroup = nGroup;
            $http.get('/api/notificationGroup/' + nGroup._id).success(function(response) {
                $log.info(response);
                $scope.notificationGroupUsers = response;
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

    }
]);
