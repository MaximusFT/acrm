'use strict';

angular.module('mean.depmanager').controller('DepartmentsController', ['$scope', 'Global', '$rootScope', '$http', '$log', '$location', '$stateParams', '$modal', 'Passwords', 'Users', 'Departments', 'modalService',
    function($scope, Global, $rootScope, $http, $log, $location, $stateParams, $modal, Passwords, Users, Departments, modalService) {
        $scope.global = Global;
        $scope.isDragEnabled = false;
        $scope.isSomeSelected = true;
        $scope.isUserSelected = [];
        $scope.user = {};

        $scope.userSchema = [{
            title: 'Email',
            schemaKey: 'email',
            type: 'text',
            inTable: true
        }, {
            title: 'Name',
            schemaKey: 'name',
            type: 'text',
            inTable: true
        }, {
            title: 'Username',
            schemaKey: 'username',
            type: 'text',
            inTable: true
        }, {
            title: 'Phone',
            schemaKey: 'phone',
            type: 'text',
            inTable: true
        }, {
            title: 'Password',
            schemaKey: 'password',
            type: 'password',
            inTable: false
        }, {
            title: 'Repeat password',
            schemaKey: 'confirmPassword',
            type: 'password',
            inTable: false
        }];

        $scope.init = function() {
            $scope.departments = [];
            $scope.getHttp1 = $http.get('/api/departmentsTree').success(function(response) {
                $log.info(response);
                $scope.departments = response.departments;
                if (response.drag)
                    $scope.dragEnabled = response.drag;
                if ($stateParams.departmentId) {
                    $scope.select($stateParams.departmentId);
                }
            }).error(function(err, status) {
                $log.error(err);
                $location.url('/error/' + status);
            });
        };

        $scope.select = function(itemId) {
            $scope.getHttp2 = $http.get('/api/department/' + itemId).success(function(response) {
                //$log.info(response);
                $scope.selectedDepartment = response;
                $location.path('/departments/' + response._id);
            }).error(function(err, status) {
                $log.error(err);
                $location.url('/error/' + status);
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
                }).error(function(err, status) {
                    $log.error(err);
                    $location.url('/error/' + status);
                });
            });
        };

        $scope.removeElement = function(scope, item) {
            //$log.info('remove', item);
            if (item && item.items && item.items.length === 0 && window.confirm('Are you shure?')) {
                Departments.remove({
                    departmentId: item.id
                });
                scope.remove();
            }
        };

        $scope.switchDrag = function() {
            //$log.info($scope.isDragEnabled);
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
            }).error(function(err, status) {
                $log.error(err);
                $location.url('/error/' + status);
            });
        }

        $scope.options = {
            accept: function(sourceNode, destNodes, destIndex) {
                $log.info('accept', sourceNode.prev(), destNodes.prev());
                return ($scope.dragEnabled && $scope.isDragEnabled);
            },
            dropped: function(event) {
                if ($scope.dragEnabled === true && $scope.isDragEnabled === true) {
                    var source = event.source.nodeScope.$modelValue;
                    var dest = event.dest.nodesScope.$parent.$modelValue;
                    //$log.info('dropped', source, dest);
                    changeParent(source, dest);
                }
            },
            beforeDrop: function(event) {
                if ($scope.dragEnabled === true && $scope.isDragEnabled === true) {
                    var elem = event.source.nodeScope.$modelValue;
                    //var source = event.source.nodesScope.$parent.$modelValue;
                    //var dest = event.dest.nodesScope.$parent.$modelValue;
                    if (!window.confirm('Are you sure you want change hierarchy for ' + elem.title + '?')) {
                        event.source.nodeScope.$$apply = false;
                    }
                }
            }
        };

        $scope.editDepartment = function(department) {
            var selectedID;
            if (department && department.parents && department.parents.length > 0)
                selectedID = department.parents[department.parents.length - 1];
            var modalOptions = {
                closeButtonText: 'Cancel',
                actionButtonText: 'Confirm',
                headerText: 'Editing department',
                bodyText: 'Edit the information about department.',
                type: 7,
                selectedID: selectedID,
                department: department
            };

            modalService.showModal({}, modalOptions).then(function(result) {
                $http.put('/api/departments/' + department._id, {
                    params: {
                        department: result
                    }
                }).success(function(response) {
                    $log.info('response', response);
                }).error(function(err, status) {
                    $log.error(err);
                    $location.url('/error/' + status);
                });
            });
        };

        // USERS FUNCTIONAL
        $scope.userSchema = [{
            title: 'Email',
            schemaKey: 'email',
            type: 'text',
            inTable: true
        }, {
            title: 'Name',
            schemaKey: 'name',
            type: 'text',
            inTable: true
        }, {
            title: 'Username',
            schemaKey: 'username',
            type: 'text',
            inTable: true
        }, {
            title: 'Phone',
            schemaKey: 'phone',
            type: 'text',
            inTable: true
        }, {
            title: 'Password',
            schemaKey: 'password',
            type: 'password',
            inTable: false
        }, {
            title: 'Repeat password',
            schemaKey: 'confirmPassword',
            type: 'password',
            inTable: false
        }];

        $scope.initUsers = function() {
            if ($scope.selectedDepartment) {
                $scope.getHttp1 = $http.get('/api/department/users/' + $scope.selectedDepartment._id).success(function(response) {
                    $log.info(response);
                    $scope.directUsers = response.directUsers;
                    $scope.subdeps = response.dependDeps;
                }).error(function(err, status) {
                    $log.error(err);
                    $location.url('/error/' + status);
                });
            }
        };

        function checkSelections() {
            var ret = false;
            angular.forEach($scope.isUserSelected, function(user) {
                if (user === true)
                    ret = true;
            });
            return !ret;
        }

        $scope.checkUser = function(index, user) {
            if (user.Selected === false)
                $scope.isUserSelected[index] = false;
            if (user.Selected === true)
                $scope.isUserSelected[index] = true;
            $scope.isSomeSelected = checkSelections();
        };

        $scope.selectAll = function() {
            var ret = false;
            // checking is already the selection in section
            angular.forEach($scope.isUserSelected, function(user) {
                if (user === true)
                    ret = true;
            });
            // if selection exists - remove it, doesn't exist – select all
            angular.forEach($scope.directUsers, function(user, uid) {
                $scope.isUserSelected[uid] = !ret;
                user.Selected = !ret;
            });
            $scope.isSomeSelected = checkSelections();
        };

        $scope.getRole = function(roles) {
            if (roles.indexOf('admin') !== -1)
                return 'A';
            if (roles.indexOf('manager') !== -1)
                return 'M';
            if (roles.indexOf('employee') !== -1)
                return 'E';
            return 'N/v';
        };

        $scope.assignRole = function(role) {
            var users = [];
            angular.forEach($scope.isUserSelected, function(user, uid) {
                if (user === true)
                    users.splice(users.length, 0, $scope.directUsers[uid]._id);
            });
            $http.post('/api/assignRole', {
                params: {
                    'users': users,
                    'role': role
                }
            }).success(function(response) {
                angular.forEach($scope.directUsers, function(user) {
                    if (user.Selected === true) {
                        user.Selected = false;
                        user.roles = response;
                    }
                });
                $scope.isUserSelected = [];
                $scope.isSomeSelected = true;
            }).error(function(err, status) {
                $log.error(err);
                $location.url('/error/' + status);
            });
        };

        $scope.bind2dep = function() {
            var modalOptions = {
                closeButtonText: 'Cancel',
                actionButtonText: 'Confirm',
                headerText: 'Choose department',
                bodyText: 'Specify what department you want to bind with user(s).',
                type: 3
            };

            modalService.showModal({}, modalOptions).then(function(result) {
                //$log.info('from modal', result);
                var users = [];
                angular.forEach($scope.isUserSelected, function(user, uid) {
                    if (user === true)
                        users.push($scope.directUsers[uid]._id);
                });
                $http.post('/api/bindToDep', {
                    params: {
                        users: users,
                        department: result
                    }
                }).success(function(response) {
                    angular.forEach($scope.directUsers, function(user) {
                        if (user.Selected === true)
                            user.Selected = false;
                    });
                    $scope.isUserSelected = [];
                    $scope.isSomeSelected = true;
                    $scope.initUsers();
                }).error(function(err, status) {
                    $log.error(err);
                    $location.url('/error/' + status);
                });
            });
        };

        $scope.clearAccesses = function() {
            var users = [];
            angular.forEach($scope.isUserSelected, function(user, uid) {
                if (user === true)
                    users.push($scope.directUsers[uid]._id);
            });
            $http.post('/api/clearAccesses', {
                params: {
                    'users': users
                }
            }).success(function(response) {
                //$log.info(response);
                angular.forEach($scope.directUsers, function(user) {
                    if (user.Selected === true)
                        user.Selected = false;
                });
                $scope.isUserSelected = [];
                $scope.isSomeSelected = true;
            }).error(function(err, status) {
                $log.error(err);
                $location.url('/error/' + status);
            });
        };

        $scope.goTo = function(url) {
            $location.url(url);
        };

    }
]);
