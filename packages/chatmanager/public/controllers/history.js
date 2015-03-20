'use strict';

angular.module('mean.chatmanager').controller('HistoryController', ['$scope', '$http', '$location', '$log', '$interval', '$timeout', 'Global',
    function($scope, $http, $location, $log, $interval, $timeout, Global) {
        $scope.global = Global;
        $scope.options = {};

        $http.get('/api/checkAccessFeature', {
            params: {
                href: $location.path()
            }
        }).success(function(data) {
            $scope.isAccess = true;
        }).error(function(err, status) {
            $log.error(err);
            $location.url('/error/' + status);
        });

        $scope.initUsers = function() {
            $http.get('/api/getChatUsers').success(function(response) {
                $log.info(response);
                $scope.users = [];
                if (response.admins)
                    $scope.users = $scope.users.concat(response.admins);
                if (response.analysts)
                    $scope.users = $scope.users.concat(response.analysts);
                if (response.clients)
                    $scope.users = $scope.users.concat(response.clients);
                $log.info($scope.users);
            }).error(function(err, status) {
                $log.error(err);
                $location.url('/error/' + status);
            });
        };

        $scope.getHistory = function() {
            $http.post('/api/getHistory', {
                params: {
                    first: $scope.options.first,
                    second: $scope.options.second
                }
            }).success(function(response) {
                $log.info(response);
                $scope.messages = response;
            }).error(function(err, status) {
                $log.error(err);
                $location.url('/error/' + status);
            });
        };

        $scope.getUserName = function(msg) {
            if (msg.user) {
                return msg.user.name;
            }
            if (msg.client) {
                return msg.client.name;
            }
        };
    }
]);
