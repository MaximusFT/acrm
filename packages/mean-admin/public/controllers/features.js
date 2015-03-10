'use strict';
angular.module('mean.mean-admin').controller('FeaturesController', ['$scope', '$location', '$log', '$http', 'Global', 'modalService',
    function($scope, $location, $log, $http, Global, modalService) {
        $scope.init = function() {
            $http.get('/api/features').success(function(data) {
                if (data) {
                    $scope.features = data;
                }
            });
        };

        $scope.addFeature = function(feature) {
            $http.post('/api/feature', {
                params: {
                    feature: feature
                }
            }).success(function(response) {
                //$log.info(response);
                //$scope.features.push(feature);
                $scope.init();
            });
        };

        $scope.assign = function(feature) {
            //$log.info('assign', feature);

            var modalOptions = {
                closeButtonText: 'Cancel',
                actionButtonText: 'Confirm',
                headerText: 'Choose person(s)',
                bodyText: 'Specify what employee you want to grant feature.',
                type: 1
            };

            modalService.showModal({}, modalOptions).then(function(result) {
                if (result && result.length)
                    $http.post('/api/provideFeature', {
                        params: {
                            'users': result,
                            'feature': feature._id
                        }
                    });
            });
        };

        $scope.revoke = function(feature) {
            //$log.info('revoke', feature);

            var modalOptions = {
                closeButtonText: 'Cancel',
                actionButtonText: 'Confirm',
                headerText: 'Choose person(s)',
                bodyText: 'Specify what employee you want to revoke feature.',
                type: 1
            };

            modalService.showModal({}, modalOptions).then(function(result) {
                if (result && result.length)
                    $http.post('/api/revokeFeature', {
                        params: {
                            'users': result,
                            'feature': feature._id
                        }
                    }).success(function(response) {
                        //$log.info('success');
                    }).error(function(err, status) {
                        $log.error(err);
                        $location.url('/error/' + status);
                    });
            });
        };

        $scope.remove = function(feature, index) {
            $scope.features.splice(index, 1);
            $http.delete('/api/feature/' + feature._id).success(function(response) {
                //$log.info(response);
            });
        };
    }
]);
