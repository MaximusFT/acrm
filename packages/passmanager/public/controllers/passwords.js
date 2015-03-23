'use strict';

angular.module('mean.passmanager').controller('PasswordsController', ['$scope', 'Global', 'Menus', '$rootScope', '$http', '$location', '$log', '$q', 'modalService', 'Passwords', 'Users', 'Requests', 'crypter',
    function($scope, Global, Menus, $rootScope, $http, $location, $log, $q, modalService, Passwords, Users, Requests, crypter) {
        $scope.global = Global;
        $scope.isSomeSelected = true;
        $scope.isPassSelected = [];
        $scope.isRequests = false;
        $scope.isPasses = false;
        $scope.radioModel = 'Left';
        $scope.dataModel = 0;
        $scope.isGroupOpened = [];
        $scope.isSentIdea = $scope.isSentRequest = false;
        $scope.alerts = [{
            type: 'danger',
            msg: 'Attention! Now, being authorized as a department manager, you have access to the passwords, which are assigned to at least one of your employee. If you take away access to the employee and it was the only employee of the department who had access to the password, the password will disappear from this list.'
        }];
        $scope.tabs = [{
            type: 1,
            title: 'Request for adding',
            icon: 'glyphicon glyphicon-plus',
            btn: ['Add', 'Remove']
        }, {
            type: 2,
            title: 'Request for editing',
            icon: 'glyphicon glyphicon-pencil',
            btn: ['Confirm', 'Reject']
        }];
        $scope.passTypes = [{
            id: 0,
            title: 'For server'
        }, {
            id: 1,
            title: 'For site'
        }, {
            id: -1,
            title: 'Other'
        }];

        $http.post('/api/mode').success(function(response) {
            $scope.mode = response;
        }).error(function(err, status) {
            $log.error(err);
            $location.url('/error/' + status);
        });

        $http.post('/api/isAdmin').success(function(response) {
            if (response.isAdmin === true) {
                $scope.btn_class = [];
            } else {
                $scope.btn_class = new Array([]);
            }
        }).error(function(err, status) {
            $location.url('/error/' + status);
        });

        Users.query({}, function(users) {
            var lols = [];
            users.forEach(function(item) {
                //$log.info(item);
                lols.push(item.username);
            });
            $scope.passSchema = [{
                title: 'Group',
                schemaKey: 'group',
                type: 'text',
                inTable: false
            }, {
                title: 'Appointment',
                schemaKey: 'implement',
                type: 'text',
                inTable: false
            }, {
                title: 'Resource Title',
                schemaKey: 'resourceName',
                type: 'text',
                inTable: true
            }, {
                title: 'Resource URL',
                schemaKey: 'resourceUrl',
                type: 'text',
                inTable: true
            }, {
                title: 'Email',
                schemaKey: 'email',
                type: 'text',
                inTable: true
            }, {
                title: 'Username',
                schemaKey: 'login',
                type: 'text',
                inTable: true
            }, {
                title: 'Password',
                schemaKey: 'hashed_password',
                type: 'password',
                inTable: true
            }, {
                title: 'Comment',
                schemaKey: 'comment',
                type: 'text',
                inTable: false
            }];
            $scope.pass = {};
        });

        $scope.init = function() {
            $scope.groups = [];
            $scope.getHttp1 = $http.get('api/getGroups').success(function(data) {
                $scope.groups = data;
                //$log.info($scope.groups);
            }).error(function(err, status) {
                $log.error(err);
                $location.url('/error/' + status);
            });
        };

        $scope.init_ = function() {
            $scope.groups = [];
            $scope.getHttp2 = $http.get('api/getAcsGroups').success(function(data) {
                $scope.groups = data;
                if (data.length > 0)
                    $scope.isPasses = true;
                //$log.warn($scope.groups);
            }).error(function(err, status) {
                $log.error(err);
                $location.url('/error/' + status);
            });
        };

        $scope.init__ = function(t) {
            $scope.requests = [];
            $scope.getHttp2 = $http.get('api/requests', {
                params: {
                    type: t
                }
            }).success(function(data) {
                //$log.warn(data);
                angular.forEach(data, function(value, key) {
                    var date = new Date(value.when * 1000);
                    value.when = date.toLocaleString();
                });
                $scope.requests = data;
                if (data.length > 0)
                    $scope.isRequests = true;
                else
                    $scope.isRequests = false;
            }).error(function(err, status) {
                $log.error(err);
                $location.url('/error/' + status);
            });
        };

        $scope.provideAccess = function(id, type) {
            var rId = $scope.requests[id]._id;
            $http({
                    url: '/api/confirmReq',
                    method: 'POST',
                    data: {
                        'reqId': rId,
                        'type': type
                    }
                })
                .then(function(response) {
                        //$log.info(response);
                        $scope.btn_class[id] = 'btn btn-success';
                    },
                    function(response) {
                        $log.error('error');
                    });
        };

        $scope.rejectAccess = function(id, type) {
            var rId = $scope.requests[id]._id;
            $http({
                    url: '/api/rejectReq',
                    method: 'POST',
                    data: {
                        'reqId': rId
                            //'type' : type
                    }
                })
                .then(function(response) {
                        //$log.info(response);
                        $scope.btn_class[id] = 'btn btn-info';
                    },
                    function(response) {
                        $log.error('error');
                    });
        };

        function getSelected() {
            var passes = [];
            angular.forEach($scope.groups, function(group) {
                angular.forEach(group.implement, function(implement) {
                    angular.forEach(implement.passes, function(pass) {
                        if (pass.Selected === true)
                            passes.push(pass._id);
                    });
                });
            });
            return passes;
        }

        $scope.assignToPerson = function() {
            var modalOptions = {
                closeButtonText: 'Cancel',
                actionButtonText: 'Confirm',
                headerText: 'Choose person(s)',
                bodyText: 'Specify what employee you want to grant access.',
                type: 1
            };

            modalService.showModal({}, modalOptions).then(function(result) {
                var passes = getSelected();
                $http.post('/api/provideAccess', {
                    params: {
                        users: result,
                        passes: passes
                    }
                }).success(function(response) {
                    unselectAll();
                }).error(function(err, status) {
                    $log.error(err);
                    $location.url('/error/' + status);
                });
            });
        };

        $scope.assignToDepartment = function() {
            var modalOptions = {
                closeButtonText: 'Cancel',
                actionButtonText: 'Confirm',
                headerText: 'Choose department',
                bodyText: 'Specify what department you want to grant access.',
                type: 2
            };

            modalService.showModal({}, modalOptions).then(function(result) {
                var passes = getSelected();
                $http.post('/api/provideAccess', {
                    params: {
                        deps: result,
                        passes: passes
                    }
                }).success(function(response) {
                    unselectAll();
                }).error(function(err, status) {
                    $log.error(err);
                    $location.url('/error/' + status);
                });
            });
        };

        $scope.revoke = function() {
            var modalOptions = {
                closeButtonText: 'Cancel',
                actionButtonText: 'Confirm',
                headerText: 'Choose person(s)',
                bodyText: 'Specify what employee you want to revoke access.',
                type: 1
            };

            modalService.showModal({}, modalOptions).then(function(result) {
                var passes = getSelected();
                $http.post('/api/revokeAccess', {
                    params: {
                        users: result,
                        passes: passes
                    }
                }).success(function(response) {
                    unselectAll();
                }).error(function(err, status) {
                    $log.error(err);
                    $location.url('/error/' + status);
                });
            });
        };

        $scope.selectAll = function(sectionIndex, implementIndex) {
            if (!$scope.isPassSelected[sectionIndex]) {
                $scope.isPassSelected[sectionIndex] = [];
            }
            if (!$scope.isPassSelected[sectionIndex][implementIndex]) {
                $scope.isPassSelected[sectionIndex][implementIndex] = [];
            }
            var ret = false;
            // checking is already the selection in section
            angular.forEach($scope.isPassSelected[sectionIndex], function(impl) {
                angular.forEach($scope.isPassSelected[sectionIndex][implementIndex], function(pass) {
                    if (pass === true) {
                        ret = true;
                    }
                });
            });
            // if selection exists - remove it, doesn't exist – select all
            angular.forEach($scope.groups[sectionIndex].implement[implementIndex].passes, function(pass, pid) {
                $scope.isPassSelected[sectionIndex][implementIndex][pid] = !ret;
                pass.Selected = !ret;
            });
            $scope.isSomeSelected = checkSelections();
        };

        function checkSelections() {
            var ret = false;
            angular.forEach($scope.groups, function(group) {
                angular.forEach(group.implement, function(implement) {
                    angular.forEach(implement.passes, function(pass) {
                        if (pass.Selected === true)
                            ret = true;
                    });
                });
            });
            return !ret;
        }

        function unselectAll() {
            angular.forEach($scope.groups, function(group) {
                angular.forEach(group.implement, function(implement) {
                    angular.forEach(implement.passes, function(pass) {
                        if (pass.Selected === true) {
                            pass.Selected = false;
                        }
                    });
                });
            });
            $scope.isSomeSelected = checkSelections();
        }

        $scope.checkPass = function() {
            $scope.isSomeSelected = checkSelections();
        };

        $scope.changeModel = function(mod) {
            $scope.dataModel = mod;
        };

        $scope.add = function() {
            if (!$scope.passwords)
                $scope.passwords = [];
            if ($scope.dataModel === 1) {
                $scope.pass.group = 'Корпоративная почта';
                $scope.pass.implement = $scope.pass.corp_email.replace(/.*@/, '');
                $scope.pass.resourceName = $scope.pass.corp_email.replace(/.*@/, '');
                $scope.pass.resourceUrl = $scope.pass.corp_email.replace(/.*@/, '');
                $scope.pass.email = $scope.pass.corp_email;
                $scope.pass.login = $scope.pass.corp_email;
                $scope.pass.hashed_password = $scope.pass.corp_hashed_password;
                $scope.pass.comment = '---';
            }
            var temp = {
                group: $scope.pass.group,
                implement: $scope.pass.implement,
                resourceName: $scope.pass.resourceName,
                resourceUrl: $scope.pass.resourceUrl,
                email: $scope.pass.email,
                login: $scope.pass.login,
                password: $scope.pass.hashed_password,
                comment: $scope.pass.comment
            };
            if ($scope.pass.forServer)
                temp.forServer = $scope.pass.forServer;
            if ($scope.pass.forSite)
                temp.forSite = $scope.pass.forSite;
            var pass = new Passwords(temp);
            pass.$save(function(response) {
                var ret = false;
                //$log.info('search the same implements');
                angular.forEach($scope.groups, function(group) {
                    angular.forEach(group.implement, function(implement) {
                        if (implement.implement === response.implement && group.group === response.group) {
                            //$log.info('found such implement. added to it');
                            ret = true;
                            implement.passes.splice(implement.passes.length, 0, response);
                        }
                    });
                });
                if (!ret) {
                    //$log.info('search the same groups');
                    angular.forEach($scope.groups, function(group) {
                        if (group.group === response.group) {
                            //$log.info('found such group');
                            ret = true;
                            var o = {
                                'implement': response.implement,
                                'passes': [response]
                            };
                            group.implement.splice(group.implement.length, 0, o);
                        }
                    });
                    if (!ret) {
                        //$log.info('not found anything. added new group');
                        var o = {
                            'group': response.group,
                            'implement': [{
                                'implement': response.implement,
                                'passes': [response]
                            }]
                        };
                        $scope.groups.splice($scope.groups.length, 0, o);
                        $scope.groups.sort(function(a, b) {
                            return a.group > b.group;
                        });
                    }
                }

                $scope.pass = {};
            });
        };

        $scope.remove = function() {
            angular.forEach($scope.groups, function(group, gid) {
                angular.forEach(group.implement, function(implement, impid) {
                    angular.forEach(implement.passes, function(pass, pid) {
                        if (pass.Selected === true) {
                            Passwords.remove({
                                passId: pass._id
                            });
                            pass.Selected = true;
                            $scope.groups[gid].implement[impid].passes.splice($scope.groups[gid].implement[impid].passes.indexOf($scope.groups[gid].implement[impid].passes[pid]), 1);
                        }
                    });
                });
            });
            $scope.isSomeSelected = checkSelections();
        };

        $scope.update = function(pass, passField) {
            Passwords.update({
                passId: pass._id
            }, {
                key: passField,
                val: pass[passField]
            });
        };

        $scope.getSumLength = function(arr) {
            var length = 0;
            angular.forEach(arr, function(item, ind) {
                angular.forEach(item.passes, function(item2, ind2) {
                    length += 1;
                });
            });
            return length;
        };

        $scope.closeAlert = function(index) {
            $scope.alerts.splice(index, 1);
        };

        $scope.getPass = function(pass) {
            return pass;
            //return crypter.decrypt(pass, crypter.hash($scope.global.user.username + $scope.global.user._id));
        };

        $scope.showPass = function(pass) {
            pass.Shown = !pass.Shown;
        };

        $scope.sendEditRequest = function(group, implement, index) {
            if ($scope.groups[group].implement[implement].passes[index].edited === true)
                return;
            var modalOptions = {
                closeButtonText: 'Cancel',
                actionButtonText: 'Confirm',
                headerText: 'Request for editing',
                bodyText: 'The new data will be formed in the request, which will be reviewed by system administrators.',
                type: 6,
                editprp: JSON.parse(JSON.stringify($scope.groups[group].implement[implement].passes[index]))
            };

            modalService.showModal({}, modalOptions).then(function(result) {
                result.hashed_password = result.password;
                var difs = [],
                    was = $scope.groups[group].implement[implement].passes[index];
                for (var property in was) {
                    if (was[property] !== result[property]) {
                        var t = {};
                        t.propertyName = property;
                        t.values = [was[property], result[property]];
                        difs.splice(difs.length, 0, t);
                    }
                }
                var request = new Requests({
                    type: 2,
                    info: difs,
                    when: new Date().getTime() / 1000,
                    comment: 'User wants to edit password'
                });
                request.$save(function(response) {
                    if (response)
                        $scope.groups[group].implement[implement].passes[index].edited = true;
                });
            });
        };

        $scope.initServers = function() {
            $scope.getHttp3 = $http.get('/api/servers_').success(function(response) {
                $scope.servers = response;
                //$log.info(response);
            }).error(function(err, status) {
                $log.error(err);
                $location.url('/error/' + status);
            });
        };

        $scope.initSites = function() {
            $scope.getHttp4 = $http.get('/api/sites').success(function(response) {
                $scope.sites = response;
                //$log.info(response);
            }).error(function(err, status) {
                $log.error(err);
                $location.url('/error/' + status);
            });
        };

        $scope.checkPassType = function(pass) {
            if ((pass.type === 0 || pass.type === -1) && pass.forSite)
                delete pass.forSite;
            if ((pass.type === 1 || pass.type === -1) && pass.forServer)
                delete pass.forServer;
        };
    }
]);
