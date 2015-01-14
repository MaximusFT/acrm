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

        $scope.departmentSchema = [{
            title: 'Name',
            schemaKey: 'label',
            type: 'text',
            inTable: true
        }, {
            title: 'Parent',
            schemaKey: 'parent',
            type: 'text',
            inTable: true
        }, {
            title: 'Left',
            schemaKey: 'left',
            type: 'text',
            inTable: true
        }, {
            title: 'Right',
            schemaKey: 'right',
            type: 'text',
            inTable: true
        }];
        $scope.department = {};

        $scope.init = function() {
            $scope.departments = [];
            $http.get('api/departments', {}).success(function(data) {
                $scope.departments = data;
                $log.info(data);
            }).error(function(data, status) {
                if (status === 500 || status === 400)
                    $location.path('/');
            });
        };

        $scope.add = function() {
            if (!$scope.departments)
                $scope.departments = [];

            var department = new Departments({
                name: $scope.department.name,
                parent: $scope.department.parent,
                left: $scope.department.left,
                right: $scope.department.right
            });
            department.$save(function(response) {
                $log.error('loh');
                $scope.departments.splice($scope.departments.length === 0 ? 1 : $scope.departments.length, 0, response);
                $scope.departments.sort(function(a, b) {
                    return a.name > b.name;
                });
            });
            //$scope.pass.group = $scope.pass.resourceName = $scope.pass.resourceUrl = $scope.pass.login = $scope.pass.hashed_password = $scope.pass.comment = $scope.pass.accessedFor = '';
        };

        $scope.remove = function(department) {
            $scope.departments.forEach(function(d) {
                if (d === department) {
                    $scope.departments.splice($scope.departments.indexOf(d), 1);
                }
            });
            Departments.remove({
                departmentId: department._id
            });
        };

        $scope.update = function(department, departmentField) {
            Departments.update({
                departmentId: department._id
            }, department);
        };

        $scope.my_tree_handler = function(branch) {
            //$log.warn(branch);
            $scope.selectedID = branch._id;
        };

        $scope.my_tree = {};

        $scope.try_adding_a_branch = function() {
            var b;
            b = $scope.my_tree.get_selected_branch();
            $scope.my_tree.add_branch(b, {
                label: 'New Branch',
                data: {
                    something: 42,
                    'else': 43
                }
            });
        };

        $scope.open = function() {
            var modalOptions = {
                closeButtonText: 'Cancel',
                actionButtonText: 'Confirm',
                headerText: 'Add new department',
                bodyText: 'Specify the information about new department.',
                type: 7
            };

            modalService.showModal({}, modalOptions).then(function(result) {
                $log.warn(result);
            });
        };
    }
]);
