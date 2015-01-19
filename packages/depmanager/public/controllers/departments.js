'use strict';

angular.module('mean.depmanager').controller('DepmanagerController', ['$scope', 'Global', 'Depmanager',
    function($scope, Global, Depmanager) {
        $scope.global = Global;
        $scope.package = {
            name: 'depmanager'
        };
    }
]);

angular.module('mean.depmanager').controller('DepartmentsController', ['$scope', 'Global', 'Menus', '$rootScope', '$http', '$log', '$location', '$modal', 'Passwords', 'Users', 'Departments', 'modalService',
    function($scope, Global, Menus, $rootScope, $http, $log, $location, $modal, Passwords, Users, Departments, modalService) {
        $scope.global = Global;
        $scope.isDragEnabled = false;

        $scope.init = function() {
            $scope.departments = [];
            $http.get('api/newDepartmentsTree', {}).success(function(data) {
                $scope.departments = data;
                //$log.info(data);
            }).error(function(data, status) {
                if (status === 500 || status === 400)
                    $location.path('/');
            });
        };

        $scope.select = function(item) {
            //$log.info('selected', item);
            $http.get('/api/department', {
                params: {
                    departmentId: item.id
                }
            }).success(function(response) {
                //$log.info(response);
                $scope.selectedDepartment = response;
            });
        };

        $scope.add = function(scope, item) {
            var modalOptions = {
                closeButtonText: 'Cancel',
                actionButtonText: 'Confirm',
                headerText: 'Add new department',
                bodyText: 'Specify the information about new department.',
                type: 7,
                selectedID: item && item.id ? item.id : null
            };

            modalService.showModal({}, modalOptions).then(function(result) {
                $http.post('/api/addNewDepartmentBranch', {
                    params: {
                        department: result
                    }
                }).success(function(response) {
                    //$log.info('response', response);
                    if (scope) {
                        var nodeData = scope.$modelValue;
                        nodeData.items.push({
                            id: response._id,
                            title: response.title,
                            items: []
                        });
                    } else
                        $scope.departments.push({
                            id: response._id,
                            title: response.title,
                            items: []
                        });
                });
            });
        };

        $scope.removeElement = function(scope, item) {
            //$log.info('remove', item);
            if (item && item.items && item.items.length === 0) {
                Departments.remove({
                    departmentId: item.id
                });
                scope.remove();
            }
        };

        $scope.switchDrag = function() {
            $log.info($scope.isDragEnabled);
            $scope.isDragEnabled = !$scope.isDragEnabled;
        };

        function changeParent(source, dest) {
            $http.post('/api/changeParent', {
                params: {
                    source: source.id,
                    dest: dest ? dest.id : null
                }
            }).success(function(response) {
                //$log.info(response);
            });
        }

        $scope.options = {
            accept: function(sourceNode, destNodes, destIndex) {
                //$log.info('accept', sourceNode.$modelValue);
                return ($scope.isDragEnabled);
            },
            dropped: function(event) {
                if ($scope.isDragEnabled === true) {
                    var source = event.source.nodeScope.$modelValue;
                    var dest = event.dest.nodesScope.$parent.$modelValue;
                    //$log.info('dropped', source, dest);
                    changeParent(source, dest);
                }
            },
            beforeDrop: function(event) {
                if ($scope.isDragEnabled === true && !window.confirm('Are you sure you want to drop it here?')) {
                    event.source.nodeScope.$$apply = false;
                }
            }
        };

    }
]);
