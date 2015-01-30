'use strict';

angular.module('mean.servermanager').controller('ServermanagerController', ['$scope', '$http', '$log', 'Global', 'Servermanager', 'modalService',
    function($scope, $http, $log, Global, Servermanager, modalService) {
        $scope.global = Global;
        $scope.isVisibleRemoveButton = [];
        $scope.deployedSites = [];

        /*$scope.gridOptions = {
            enableSorting: true,
            onRegisterApi: function(gridApi) {
                $scope.gridApi = gridApi;
            }
        };*/

        $scope.init = function() {
            $scope.getHttp1 = $http.get('/api/servers').success(function(response) {
                $scope.servers = response;
                $log.info(response);
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
                $log.info('select server', response);
                $scope.selectedServer = response.server;
                $scope.deployedSites = response.sites;
            }).error(function(err) {
                $log.error(err);
            });
        };

        $scope.removeServer = function(server, index) {
            if ($scope.deployedSites.length === 0) {
                $http.delete('/api/server', {
                    params: {
                        server: server._id
                    }
                }).success(function(response) {
                    $scope.servers.splice(index, 1);
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
    }
]);
