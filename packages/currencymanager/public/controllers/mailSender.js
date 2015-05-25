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
            $http.post('/api/sendInstructions', {
                user: user
            }).success(function(response) {
                $log.info(response);
            }).error(function(err, status) {
                $log.error(err, status);
            });
        };
    }
]);
