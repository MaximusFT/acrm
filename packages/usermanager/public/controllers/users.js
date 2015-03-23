'use strict';

angular.module('mean.usermanager').controller('UsersController', ['$scope', '$location', '$rootScope', '$http', '$log', 'Users', 'modalService', 'Global', 'Menus',
    function($scope, $location, $rootScope, $http, $log, Users, modalService, Global, Menus) {
        $scope.global = Global;
        $scope.isSomeSelected = true;
        $scope.user = {};

        $http.post('/api/mode').success(function(response) {
            if (response)
                $scope.mode = response;
            else
                $location.href('/error/' + 403);
        }).error(function(err, status) {
            $log.error(err);
            $location.url('/error/' + status);
        });

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

        $scope.assignRoles = [{
            id: 2,
            title: 'Manager'
        }, {
            id: 3,
            title: 'Employee'
        }];

        $http.post('/api/isAdmin').success(function(response) {
            if (response.isAdmin === true) {
                $scope.assignRoles.splice(0, 0, {
                    id: 1,
                    title: 'Administrator'
                });
            }
        }).error(function(err, status) {
            $log.error(err);
            $location.url('/error/' + status);
        });

        function getSelectedUsers() {
            var users = [];
            angular.forEach($scope.departments, function(department) {
                angular.forEach(department.users, function(user) {
                    if (user.Selected === true)
                        users.push(user._id);
                });
            });
            return users;
        }

        $scope.init = function() {
            $scope.getHttp1 = $http.get('api/allUsersByDeps').success(function(response) {
                //$log.info(response);
                $scope.departments = response;
            }).error(function(err, status) {
                $log.error(err);
                $location.url('/error/' + status);
            });
        };

        $scope.add = function() {
            if (!$scope.passwords)
                $scope.passwords = [];

            var user = new Users({
                email: $scope.user.email,
                name: $scope.user.name,
                username: $scope.user.username,
                department: $scope.user.department,
                phone: $scope.user.phone,
                password: $scope.user.password,
                confirmPassword: $scope.user.confirmPassword,
                roles: ['authenticated']
            });

            user.$save(function(response) {
                var ret = false;
                //$log.info('search the same departments');
                angular.forEach($scope.departments, function(department) {
                    if (department.department === response.department.name) {
                        //$log.info('found such implement. added to it');
                        ret = true;
                        department.users.splice(department.users.length, 0, response);
                    }
                });

                if (!ret) {
                    //$log.info('not found anything. added new group');
                    var o = {
                        'department': response.department.name,
                        'users': [response]
                    };
                    $scope.departments.splice($scope.departments.length, 0, o);
                    $scope.departments.sort(function(a, b) {
                        return a.department > b.department;
                    });
                }
                $scope.init();
            });
        };

        $scope.remove = function() {
            var users = getSelectedUsers();
            $http.post('/api/removeUsers', {
                params: {
                    users: users
                }
            }).success(function(response) {
                angular.forEach($scope.departments, function(department, did) {
                    angular.forEach(department.users, function(user, uid) {
                        if (users.indexOf(user._id) !== -1) {
                            $scope.departments[did].users.splice(uid, 1);
                        }
                    });
                });
                angular.forEach($scope.departments, function(department) {
                    angular.forEach(department.users, function(user) {
                        delete user.Selected;
                    });
                });
            }).error(function(err, status) {
                $log.error(err);
                $location.url('/error/' + status);
            });
        };

        $scope.update = function(user, userField) {
            Users.update({
                userId: user._id
            }, {
                key: userField,
                val: user[userField]
            });
        };

        $scope.beforeSelect = function(userField, user) {
            if (userField === 'email')
                user.tmpEmail = user.email;
            if (userField === 'name')
                user.tmpName = user.name;
            if (userField === 'username')
                user.tmpUsername = user.username;
            if (userField === 'department')
                user.tmpDepartment = user.department;
            if (userField === 'roles')
                user.tmpRoles = ['authenticated']; //user.roles;
        };

        $scope.onTypeSearch = function() {
            angular.forEach($scope.departments, function(department) {
                angular.forEach(department.users, function(user) {
                    if (user.Selected === true)
                        user.Selected = false;
                });
            });
            $scope.isSomeSelected = checkSelections();
        };

        $scope.selectAll = function(sectionIndex, isSearch) {
            if (!isSearch) {
                var ret = false;
                // checking is already the selection in section
                angular.forEach($scope.departments, function(department) {
                    angular.forEach(department.users, function(user) {
                        if (user.Selected === true)
                            ret = true;
                    });
                });
                // if selection exists - remove it, doesn't exist – select all
                angular.forEach($scope.departments[sectionIndex].users, function(user, uid) {
                    user.Selected = !ret;
                });
                $scope.isSomeSelected = checkSelections();
            } else {
                alert('You cannot select all when search filter is on');
            }
        };

        function checkSelections() {
            var ret = false;
            angular.forEach($scope.departments, function(department) {
                angular.forEach(department.users, function(user) {
                    if (user.Selected === true)
                        ret = true;
                });
            });
            return !ret;
        }

        $scope.checkUser = function() {
            $scope.isSomeSelected = checkSelections();
        };

        $scope.assignRole = function(role) {
            var users = getSelectedUsers();
            $http.post('/api/assignRole', {
                params: {
                    users: users,
                    role: role
                }
            }).success(function(response) {
                //$log.info(response);
                var r = response.substring(0, 1).toUpperCase();
                angular.forEach($scope.departments, function(department) {
                    angular.forEach(department.users, function(user) {
                        if (user.Selected === true) {
                            user.roles = r;
                            user.Selected = false;
                        }
                    });
                });
                $scope.isSomeSelected = checkSelections();
            }).error(function(err) {
                $log.error(err, status);
                $location.url('/errors/' + status);
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
                var users = getSelectedUsers();
                $http.post('/api/bindToDep', {
                    params: {
                        users: users,
                        department: result
                    }
                }).success(function(response) {
                    angular.forEach($scope.departments, function(department) {
                        angular.forEach(department.users, function(user) {
                            if (user.Selected === true)
                                user.Selected = false;
                        });
                    });
                    $scope.init();
                    $scope.isSomeSelected = checkSelections();
                }).error(function(err, status) {
                    $log.error(err);
                    $location.url('/error/' + status);
                });
            });
        };

        $scope.clearAccesses = function() {
            var users = getSelectedUsers();
            $http.post('/api/clearAccesses', {
                params: {
                    users: users
                }
            }).success(function(response) {
                //$log.info(response);
                angular.forEach($scope.departments, function(department) {
                    angular.forEach(department.users, function(user) {
                        if (user.Selected === true) {
                            user.Selected = false;
                        }
                    });
                });
                $scope.isSomeSelected = checkSelections();
            }).error(function(err, status) {
                $log.error(err);
                $location.url('/errors/' + status);
            });
        };

        $scope.goTo = function(url) {
            $location.url(url);
        };

        $scope.getStyle = function(role) {
            if (role === 'N/v')
                return 'color:red;';
            if (role === 'A')
                return 'font-weight:bolder;color:blue;';
            if (role === 'M')
                return 'font-weight:bolder;color:gray;';
        };

    }
]);
