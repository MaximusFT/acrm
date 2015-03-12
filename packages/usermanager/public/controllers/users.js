'use strict';

angular.module('mean.usermanager').controller('UsersController', ['$scope', '$cookies', '$location', '$rootScope', '$http', '$log', 'Users', 'modalService', 'Global', 'Menus',
    function($scope, $cookies, $location, $rootScope, $http, $log, Users, modalService, Global, Menus) {
        $scope.global = Global;
        $scope.package = {
            name: 'usermanager'
        };
        $scope.mode = $cookies.mode;
        $scope.isSomeSelected = true;
        $scope.isUserSelected = [];
        $scope.getHttp1 = null;

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
        $scope.user = {};

        $scope.init = function() {
            $scope.getHttp1 = $http.get('api/allUsersByDeps').success(function(response) {
                $log.info(response);
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
            var users = [];
            angular.forEach($scope.isUserSelected, function(department, did) {
                angular.forEach(department, function(user, uid) {
                    if (user === true) {
                        users.push($scope.departments[did].users[uid]._id);
                    }
                });
            });
            $http.post('/api/removeUsers', {
                params: {
                    users: users
                }
            }).success(function(response) {
                angular.forEach($scope.departments, function(department, did) {
                    angular.forEach(department.users, function(user, uid) {
                        $log.info(user);
                        if (users.indexOf(user._id) !== -1) {
                            $log.info('yes');
                            $scope.departments[did].users.splice(uid, 1);
                        }
                    });
                });
                angular.forEach($scope.departments, function(department) {
                    angular.forEach(department.users, function(user) {
                        delete user.Selected;
                    });
                });
                $scope.isUserSelected = [];
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

        $scope.selectAll = function(sectionIndex) {
            if (!$scope.isUserSelected[sectionIndex]) {
                $scope.isUserSelected[sectionIndex] = [];
            }
            var ret = false;
            // checking is already the selection in section
            angular.forEach($scope.isUserSelected, function(department) {
                angular.forEach(department, function(user) {
                    if (user === true)
                        ret = true;
                });
            });
            // if selection exists - remove it, doesn't exist – select all
            angular.forEach($scope.departments[sectionIndex].users, function(user, uid) {
                $scope.isUserSelected[sectionIndex][uid] = !ret;
                user.Selected = !ret;
            });
            $scope.isSomeSelected = checkSelections();
        };

        function checkSelections() {
            var ret = false;
            angular.forEach($scope.isUserSelected, function(department) {
                angular.forEach(department, function(user) {
                    if (user === true)
                        ret = true;
                });
            });
            return !ret;
        }

        $scope.checkUser = function(sectionIndex, index, user) {
            if (!$scope.isUserSelected[sectionIndex])
                $scope.isUserSelected[sectionIndex] = [];
            if (user.Selected === false)
                $scope.isUserSelected[sectionIndex][index] = false;
            if (user.Selected === true)
                $scope.isUserSelected[sectionIndex][index] = true;
            $scope.isSomeSelected = checkSelections();
        };

        $scope.assignRole = function(role) {
            $scope.ttt = false;
            var users = [];
            angular.forEach($scope.isUserSelected, function(department, did) {
                angular.forEach(department, function(user, uid) {
                    if (user === true)
                        users.splice(users.length, 0, $scope.departments[did].users[uid]._id);
                });
            });
            $http({
                    url: '/api/assignRole',
                    method: 'POST',
                    data: {
                        'users': users,
                        'role': role
                    }
                })
                .then(function(response) {
                        var r = response.data.substring(0, 1).toUpperCase();
                        angular.forEach($scope.departments, function(department) {
                            angular.forEach(department.users, function(user) {
                                if (user.Selected === true) {
                                    user.roles = r;
                                    user.Selected = false;
                                }
                            });
                        });
                        $scope.isUserSelected = [];
                        $scope.isSomeSelected = true;
                    },
                    function(response) {
                        $log.error('error');
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
                angular.forEach($scope.isUserSelected, function(department, did) {
                    angular.forEach(department, function(user, uid) {
                        if (user === true)
                            users.splice(users.length, 0, $scope.departments[did].users[uid]._id);
                    });
                });
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
                    $scope.isUserSelected = [];
                    $scope.isSomeSelected = true;
                }).error(function(err, status) {
                    $log.error(err);
                    $location.url('/error/' + status);
                });
            });
        };

        $scope.clearAccesses = function() {
            var users = [];
            angular.forEach($scope.isUserSelected, function(department, did) {
                angular.forEach(department, function(user, uid) {
                    if (user === true)
                        users.splice(users.length, 0, $scope.departments[did].users[uid]._id);
                });
            });
            $http({
                    url: '/api/clearAccesses',
                    method: 'POST',
                    data: {
                        'users': users
                    }
                })
                .then(function(response) {
                        //$log.info(response);
                        angular.forEach($scope.departments, function(department) {
                            angular.forEach(department.users, function(user) {
                                if (user.Selected === true) {
                                    user.Selected = false;
                                }
                            });
                        });
                        $scope.isUserSelected = [];
                        $scope.isSomeSelected = true;
                    },
                    function(response) {
                        $log.error('error');
                    });
        };

        $scope.goTo = function(url) {
            $location.url(url);
        };

    }
]);
