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
                $location.url('/error/' + 403);
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
            type: 'text',
            inTable: false
        }, {
            title: 'Repeat password',
            schemaKey: 'confirmPassword',
            type: 'text',
            inTable: false
        }];

        $scope.assignRoles = [{
            id: 2,
            title: 'Manager'
        }, {
            id: 3,
            title: 'Employee'
        }, {
            id: 4,
            title: 'Fired'
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

        $scope.initDeps = function() {
            $http.get('/api/getNewDeps').success(function(data) {
                //$log.info(data);
                $scope.deps = data;
            }).error(function(err, status) {
                $log.error(err);
                $location.url('/error/' + status);
            });
        };


        $scope.add = function() {
            if (!$scope.passwords)
                $scope.passwords = [];
            $scope.registerError = null;
            $http.post('/register', {
                    email: $scope.user.email,
                    password: $scope.user.password,
                    confirmPassword: $scope.user.confirmPassword,
                    username: $scope.user.username,
                    name: $scope.user.name,
                    department: $scope.user.department ? $scope.user.department : null
                })
                .success(function() {
                    $scope.user = {};
                    $scope.addedSuccessfully = true;
                })
                .error(function(error) {
                    $log.error(error);
                    $scope.registerError = error;
                });
        };

        $scope.remove = function() {
            if (window.confirm('Are you shure?')) {
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
            }
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
                var r = response !== '' ? response.substring(0, 1).toUpperCase() : 'N/a';
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
            if (role === 'F')
                return 'opacity:0.25;';
        };

        $scope.formateDate = function(date) {
            return new Date(date).toLocaleString();
        };

        $scope.genPass = function(user) {
            var chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890',
                pass = '',
                length = 10;
            for (var x = 0; x < length; x = x + 1) {
                var i = Math.floor(Math.random() * 62);
                pass += chars.charAt(i);
            }
            user.password = user.confirmPassword = pass;
        };

        $scope.initNGroups = function() {
            $scope.getHttp2 = $http.get('/api/notificationGroups').success(function(response) {
                $scope.notificationGroups = response;
            }).error(function(err, status) {
                $log.error(err);
                $location.url('/errors/' + status);
            });
        };

        $scope.addNotificationGroup = function(nGroup) {
            $http.post('/api/notificationGroup', nGroup).success(function(response) {
                $scope.initNGroups();
            }).error(function(err, status) {
                $log.error(err);
                $location.url('/errors/' + status);
            });
        };

        $scope.updateNotificationGroup = function(nGroup, field) {
            $http.put('/api/notificationGroup/' + nGroup._id, {
                key: field,
                val: nGroup[field]
            }).success(function(response) {
                $log.info(response);
            }).error(function(err, status) {
                $log.error(err);
                $location.url('/errors/' + status);
            });
        };

        $scope.showAssignedToNGroup = function(nGroup) {
            $scope.selectedNGroup = nGroup;
            $http.get('/api/notificationGroup/' + nGroup._id).success(function(response) {
                $log.info(response);
                $scope.notificationGroupUsers = response;
            }).error(function(err, status) {
                $log.error(err);
                $location.url('/errors/' + status);
            });
        };

        $scope.assignToNotificationGroup = function(nGroup) {
            var modalOptions = {
                closeButtonText: 'Cancel',
                actionButtonText: 'Confirm',
                headerText: 'Choose person(s)',
                bodyText: 'Specify what employee you want to assign new responsibility.',
                type: 1
            };

            modalService.showModal({}, modalOptions).then(function(result) {
                $http.post('/api/notificationGroup/' + nGroup._id, {
                    users: result
                }).success(function(response) {
                    $scope.showAssignedToNGroup(nGroup);
                }).error(function(err, status) {
                    $log.error(err);
                    $location.url('/errors/' + status);
                });
            });
        };

        $scope.removeNotificationGroup = function(nGroup) {
            if (window.confirm('Are you shure?')) {
                $http.delete('/api/notificationGroup/' + nGroup._id).success(function(response) {
                    $scope.initNGroups();
                }).error(function(err, status) {
                    $log.error(err);
                    $location.url('/errors/' + status);
                });
            }
        };

    }
]);
