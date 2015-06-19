'use strict';

angular.module('mean.currencymanager').controller('MailSenderController', ['$scope', '$log', '$http', '$location', 'Global',
    function($scope, $log, $http, $location, Global) {
        $scope.global = Global;

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

        $scope.sendInstructions = function(user) {
            $scope.isSending = true;
            $http.post('/api/sendInstructions', {
                user: user
            }).success(function(response) {
                // $log.info(response);
                $scope.response = response;
                $scope.isSending = false;
                $scope.isSent = true;
            }).error(function(err, status) {
                $log.error(err, status);
            });
        };

        $scope.setSentFalse = function() {
            $scope.isSent = false;
        };

        $scope.sendInstructions2 = function(data) {
            $scope.isSending2 = true;
            $http.post('/api/sendInstructions2', {
                data: data
            }).success(function(response) {
                // $log.info(response);
                $scope.response2 = response;
                $scope.isSending2 = false;
                $scope.isSent2 = true;
            }).error(function(err, status) {
                $log.error(err, status);
            });
        };

        $scope.setSentFalse2 = function() {
            $scope.isSent2 = false;
        };
    }
]);
