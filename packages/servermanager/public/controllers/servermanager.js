'use strict';

angular.module('mean.servermanager').controller('ServermanagerController', ['$scope', '$http', '$log', '$window', '$stateParams', '$location', 'Global', 'Servermanager', 'modalService',
    function($scope, $http, $log, $window, $stateParams, $location, Global, Servermanager, modalService) {
        $scope.global = Global;
        $scope.isVisibleRemoveButton = [];
        $scope.deployedSites = [];

        $scope.init = function() {
            $scope.getHttp1 = $http.get('/api/servers_').success(function(response) {
                $scope.servers = response;
                //$log.info(response);
                if ($stateParams.serverId) {
                    angular.forEach($scope.servers, function(server, index) {
                        if (server._id === $stateParams.serverId)
                            $scope.selectServer(server, index);
                    });
                }
            }).error(function(err) {
                $log.error(err);
            });
        };

        $scope.addServer = function() {
            var modalOptions = {
                closeButtonText: 'Cancel',
                actionButtonText: 'Confirm',
                headerText: 'Adding server',
                bodyText: 'Specify information about new server.',
                type: 8
            };

            modalService.showModal({}, modalOptions).then(function(result) {
                $log.info('result', result);
                $http.post('/api/server', {
                    params: {
                        server: result
                    }
                }).success(function(response) {
                    $scope.servers.push(response);
                }).error(function(err) {
                    $log.error(err);
                });
            });
        };

        $scope.selectServer = function(server, index) {
            $scope.isVisibleRemoveButton = [];
            $scope.isVisibleRemoveButton[index] = true;
            $scope.getHttp2 = $http.get('/api/server', {
                params: {
                    server: server._id
                }
            }).success(function(response) {
                //$log.info('select server', response);
                $scope.selectedServer = response.server;
                $scope.deployedSites = response.sites;
                $scope.referencedPasswords = response.passwords;
                $location.path('/servers/' + server._id);
            }).error(function(err) {
                $log.error(err);
            });
        };

        $scope.editServer = function(server) {
            var modalOptions = {
                closeButtonText: 'Cancel',
                actionButtonText: 'Confirm',
                headerText: 'Editing server',
                bodyText: 'Update information about server.',
                server: server,
                type: 8
            };

            modalService.showModal({}, modalOptions).then(function(result) {
                /* jshint ignore:start */
                var difs = [],
                    ips = [];
                for (var property in server) {
                    if (server[property] !== result[property]) {
                        if (property !== 'ips') {
                            var t = {};
                            t.propertyName = property;
                            t.values = [server[property], result[property]];
                            difs.splice(difs.length, 0, t);
                        } else {
                            angular.forEach(result.ips, function(ip) {
                                ips.push(ip.text);
                            });
                            if (server[property].toString() !== ips.toString()) {
                                difs.splice(difs.length, 0, {
                                    propertyName: property,
                                    values: [server[property], ips]
                                });
                            }
                        }
                    }
                }
                $http.put('/api/server/' + server._id, {
                    params: {
                        difs: difs
                    }
                }).success(function(response) {
                    angular.forEach($scope.servers, function(s, index) {
                        if (s._id === response._id) {
                            $scope.servers.splice(index, 1);
                            $scope.servers.splice(index, 0, response);
                        }
                        if (s._id === $scope.selectedServer._id)
                            $scope.selectedServer = response;
                    });
                }).error(function(err) {
                    $log.error(err);
                });
                /* jshint ignore:end */
            });
        };

        $scope.removeServer = function(server, index) {
            if ($scope.deployedSites.length === 0 && $scope.referencedPasswords.length === 0) {
                $http.delete('/api/server', {
                    params: {
                        server: server._id
                    }
                }).success(function(response) {
                    $scope.servers.splice(index, 1);
                    if ($scope.selectedServer._id === server._id)
                        $scope.selectedServer = null;
                }).error(function(err) {
                    $log.error(err);
                });
            }
        };

        $scope.addSite = function() {
            var modalOptions = {
                closeButtonText: 'Cancel',
                actionButtonText: 'Confirm',
                headerText: 'Adding site',
                bodyText: 'Specify information about binded site.',
                type: 9,
            };

            modalService.showModal({}, modalOptions).then(function(result) {
                $log.info('result', result);
                result.server = $scope.selectedServer._id;
                $http.post('/api/site', {
                    params: {
                        site: result
                    }
                }).success(function(response) {
                    $scope.deployedSites.push(response);
                }).error(function(err) {
                    $log.error(err);
                });
            });
        };

        $scope.updateSite = function(site, field) {
            $http.put('/api/site/' + site._id, {
                params: {
                    key: field,
                    val: site[field]
                }
            }).error(function(err) {
                $log.error(err);
            });
        };

        $scope.removeSite = function(site, index) {
            $http.delete('/api/site/' + site._id).success(function(response) {
                $scope.deployedSites.splice(index, 1);
            }).error(function(err) {
                $log.error(err);
            });
        };

        $scope.getPass = function(pass) {
            return pass;
        };

        $scope.showPass = function(index) {
            if (!$scope.isPassShown)
                $scope.isPassShown = [];
            $scope.isPassShown[index] = !$scope.isPassShown[index];
        };
    }
]);
