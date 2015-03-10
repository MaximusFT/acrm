'use strict';

angular.module('mean.chatmanager').controller('ChatmanagerController', ['$scope', '$http', '$location', '$log', '$interval', '$timeout', 'Global', 'Chatmanager',
    function($scope, $http, $location, $log, $interval, $timeout, Global, Chatmanager) {
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

        $scope.options = [{
            title: 'All online users',
            hrefTitle: 'Show list',
            class: 'onlineAll',
            html: 'chatmanager/views/allOnline.html'
        }, {
            title: 'Analysts',
            hrefTitle: 'Show list',
            class: 'onlineAnalysts',
            html: 'chatmanager/views/analystsOnline.html'
        }, {
            title: 'Clients',
            hrefTitle: 'Show list',
            class: 'onlineClients',
            html: 'chatmanager/views/clientsOnline.html'
        }, {
            title: 'Chat settings',
            hrefTitle: 'Show settings',
            class: 'settings',
            html: 'chatmanager/views/settings.html'
        }];

        var refreshStats = $interval(function() {
            $http.get('/api/getChatStats', {
                params: {
                    t: new Date().getTime()
                }
            }).success(function(response) {
                //$log.info('refresh response', response);
                if (response.analysts && response.clients && response.guests) {
                    $scope.analysts = response.analysts;
                    $scope.clients = response.clients;
                    $scope.users = response.analysts.concat(response.clients).concat(response.guests);
                    $scope.options[0].statNum = response.analysts.length + response.clients.length + response.guests.length;
                    $scope.options[1].statNum = response.analysts.length;
                    $scope.options[2].statNum = response.clients.length;
                }
            }).error(function(err, status) {
                $log.error(err);
                $location.url('/error/' + status);
            });
        }, 5000);

        $scope.selectMenuItem = function(index) {
            $scope.includePath = $scope.options[index].html;
        };

        $scope.$on('$destroy', function() {
            $interval.cancel(refreshStats);
        });

        $scope.changeMode = function() {
            $http.put('/api/changeGuestMode', {
                params: {
                    isGuestModeEnabled: !$scope.isGuestModeEnabled
                }
            }).success(function(response) {
                $log.info(response);
                $scope.isGuestModeEnabled = !$scope.isGuestModeEnabled;
            }).error(function(err, status) {
                $log.error(err);
                $location.url('/error/' + status);
            });
        };

        $scope.initSettings = function() {
            $http.get('/api/getGuestMode').success(function(response) {
                $scope.isInitialized = true;
                if (response && response.isGuestModeEnabled)
                    $scope.isGuestModeEnabled = response.isGuestModeEnabled;
            }).error(function(err, status) {
                $log.error(err);
                $location.url('/error/' + status);
            });
        };
    }
]);
