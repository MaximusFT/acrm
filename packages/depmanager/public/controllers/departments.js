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
            dragStop: function(ret) {
                var source = ret.source.nodeScope.$modelValue;
                var dest = ret.dest.nodesScope.$parent.$modelValue;
                changeParent(source, dest);
                return true;
            }
        };

    }
]);
