'use strict';

angular.module('mean.passmanager').controller('PassController', ['$scope', 'Global', 'Menus', '$rootScope', '$http', '$log', '$stateParams', '$location', 'Passwords', 'Users',
    function($scope, Global, Menus, $rootScope, $http, $log, $stateParams, $location, Passwords, Users) {
        $scope.global = Global;
        $scope.passId = $stateParams.passId;

        $http.post('/api/isAdmin').success(function(response) {
            if (response.isAdmin !== true)
                $location.url('/error/' + 403);
        }).error(function(err, status) {
            $location.url('/error/' + status);
        });

        $http.post('/api/mode').success(function(response) {
            $scope.mode = response;
        }).error(function(err, status) {
            $log.error(err);
            $location.url('/error/' + status);
        });

        $scope.isPasses = false;

        Users.query({}, function(users) {
            var lols = [];
            users.forEach(function(item) {
                //$log.info(item);
                lols.push(item.username);
            });
            $scope.passSchema = [{
                title: 'Group',
                schemaKey: 'group',
                type: 'text',
                inTable: true
            }, {
                title: 'Appointment',
                schemaKey: 'implement',
                type: 'text',
                inTable: true
            }, {
                title: 'Resource Title',
                schemaKey: 'resourceName',
                type: 'text',
                inTable: true
            }, {
                title: 'Resource URL',
                schemaKey: 'resourceUrl',
                type: 'text',
                inTable: true
            }, {
                title: 'Email',
                schemaKey: 'email',
                type: 'text',
                inTable: true
            }, {
                title: 'Login',
                schemaKey: 'login',
                type: 'text',
                inTable: true
            }, {
                title: 'Password',
                schemaKey: 'hashed_password',
                type: 'text',
                inTable: true
            }, {
                title: 'Comment',
                schemaKey: 'comment',
                type: 'text',
                inTable: true
            }];
            $scope.pass = {};
        });

        $scope.passTypes = [{
            id: 0,
            title: 'For server'
        }, {
            id: 1,
            title: 'For site'
        }, {
            id: -1,
            title: 'Other'
        }];

        $scope.init = function() {
            $scope.passwords = [];
            $http.get('api/getPass', {
                params: {
                    passId: $scope.passId
                }
            }).success(function(data) {
                $scope.passwords = data;
                angular.forEach($scope.passwords, function(pass) {
                    pass.type = pass.forServer ? 0 : (pass.forSite ? 1 : -1);
                });
                if (data.length > 0)
                    $scope.isPasses = true;
            }).error(function(err, status) {
                $log.error(err);
                $location.url('/error/' + status);
            });
        };

        $scope.update = function(pass, passField) {
            Passwords.update({
                passId: pass._id
            }, {
                key: passField,
                val: pass[passField]
            });
        };

        $scope.initServers = function() {
            $scope.getHttp3 = $http.get('/api/servers_').success(function(response) {
                $scope.servers = response;
                //$log.info(response);
            }).error(function(err, status) {
                $log.error(err);
                $location.url('/error/' + status);
            });
        };

        $scope.initSites = function() {
            $scope.getHttp4 = $http.get('/api/sites').success(function(response) {
                $scope.sites = response;
                //$log.info(response);
            }).error(function(err, status) {
                $log.error(err);
                $location.url('/error/' + status);
            });
        };

        $scope.checkPassType = function(pass) {
            if ((pass.type === 0 || pass.type === -1) && pass.forSite)
                delete pass.forSite;
            if ((pass.type === 1 || pass.type === -1) && pass.forServer)
                delete pass.forServer;
            if (pass.forServer)
                $scope.update(pass, 'forServer');
            if (pass.forSite)
                $scope.update(pass, 'forSite');
        };
    }
]);
