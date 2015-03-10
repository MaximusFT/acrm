'use strict';

angular.module('mean.passmanager').controller('DepartmentController', ['$scope', 'Global', 'Menus', '$rootScope', '$http', '$log', '$stateParams', '$location', 'Passwords', 'Users', 'Departments',
    function($scope, Global, Menus, $rootScope, $http, $log, $stateParams, $location, Passwords, Users, Departments) {
        $scope.global = Global;
        $scope.departmentId = $stateParams.departmentId;

        $scope.departmentSchema = [{
            title: 'Name',
            schemaKey: 'name',
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
            $http.get('api/department/' + $scope.departmentId).success(function(data) {
                //$log.info(data);
                $scope.departments = [data];
            }).error(function(err, status) {
                $log.error(err);
                $location.url('/error/' + status);
            });
        };

        $scope.update = function(department, departmentField) {
            //pass.$update();
            Departments.update({
                departmentId: department._id
            }, department);
        };
    }
]);
