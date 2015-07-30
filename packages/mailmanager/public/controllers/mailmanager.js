'use strict';

/* jshint -W098 */
angular.module('mean.mailmanager').controller('MailmanagerController', ['$scope', '$window', '$http', '$location', '$log', '$stateParams', 'Global', 'Mailmanager', 'modalService', 'crypter',
    function($scope, $window, $http, $location, $log, $stateParams, Global, Mailmanager, modalService, crypter) {
        $scope.global = Global;
        $scope.package = {
            name: 'mailmanager'
        };
        $scope.oneAtATime = true;
        $scope.mailboxes = [];
        $scope.domains = [];
        $scope.isSomeSelected = true;
        $scope.isMailSelected = [];
        $scope.tempdomain = '';
        $scope.domainAddState = false;
        $scope.autologinStatus = true;
        $scope.autologinErrorText = '';
        $scope.status = {
            isFirstOpen: true,
            isFirstDisabled: false
        };
        $scope.checkMail = function(sectionIndex, index, mail) {
            if (!$scope.isMailSelected[sectionIndex])
                $scope.isMailSelected[sectionIndex] = [];
            if (mail.Selected === false)
                $scope.isMailSelected[sectionIndex][index] = false;
            if (mail.Selected === true)
                $scope.isMailSelected[sectionIndex][index] = true;
            $scope.isSomeSelected = checkSelections();

        };

        function checkSelections() {
            var ret = false;
            $scope.isMailSelected.forEach(function(group) {
                angular.forEach(group, function(mail) {
                    if (mail === true)
                        ret = true;
                });
            });
            return !ret;
        }

        function unselectAll() {
            angular.forEach($scope.mailboxes, function(group) {
                angular.forEach(group.data, function(mail) {
                    if (mail.Selected === true) {
                        mail.Selected = false;
                    }

                });
            });
            $scope.isMailSelected = [];
            $scope.isSomeSelected = true;
        }
        $scope.selectAll = function(sectionIndex) {
            var clear;
            if ($scope.isMailSelected[sectionIndex] && $scope.isMailSelected[sectionIndex][0] === true)
                clear = false;
            else
                clear = true;
            for (var i = 0; i < $scope.mailboxes[sectionIndex].data.length; i += 1) {
                $scope.mailboxes[sectionIndex].data[i].Selected = clear;
                $scope.checkMail(sectionIndex, i, $scope.mailboxes[sectionIndex].data[i]);
            }
            $scope.isSomeSelected = checkSelections();
        };
        $scope.sortbyfield = function(sectionIndex, field) {
            $scope.mailboxes[sectionIndex].data.sort(function compare(a, b) {
                return a[field] < b[field] ? 1 : -1;
            });
        };
        $scope.remove = function() {
            unselectAll();
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
                var mails = [];
                angular.forEach($scope.isMailSelected, function(group, gind) {
                    angular.forEach(group, function(mail, pind) {
                        if (mail === true) {

                            mails.splice(mails.length, 0, $scope.mailboxes[gind].data[pind]._id);

                        }
                    });
                });
                $http({
                        url: '/api/revokeAccessForMailbox',
                        method: 'POST',
                        data: {
                            'users': result,
                            'mails': mails
                        }
                    })
                    .then(function(response) {
                            unselectAll();
                        },
                        function(response) {
                            $log.error('error');
                        });
            });
        };
        $scope.configModal = function() {
            var modalOptions = {
                closeButtonText: 'Cancel',
                actionButtonText: 'Confirm',
                headerText: 'Mail Server Config',
                bodyText: 'Here you can set your Mail Server config or update it',
                type: 11
            };

            modalService.showModal({}, modalOptions).then(function(result) {
                if (result.isRcInDefFolder === true)
                    result.RcCustomFolder = '';
                if (result.isPfInDefFolder === true)
                    result.PfCustomFolder = '';
                $http.post('/api/updateConfig', {
                    params: {
                        packageName: 'mailmanager',
                        data: result
                    }
                });
                window.location.reload();
            });
        };
        $scope.assignToPerson = function() {
            var modalOptions = {
                closeButtonText: 'Cancel',
                actionButtonText: 'Confirm',
                headerText: 'Choose person(s)',
                bodyText: 'Specify what employee you want to grant access.',
                type: 1
            };

            modalService.showModal({}, modalOptions).then(function(result) {
                var mails = [];
                angular.forEach($scope.isMailSelected, function(group, gind) {
                    angular.forEach(group, function(mail, pind) {
                        if (mail === true) {

                            mails.splice(mails.length, 0, $scope.mailboxes[gind].data[pind]._id);

                        }
                    });
                });
                $http({
                        url: '/api/provideAccessForMailbox',
                        method: 'POST',
                        data: {
                            'users': result,
                            'mails': mails
                        }
                    })
                    .then(function(response) {
                            unselectAll();
                        },
                        function(response) {
                            $log.error('error');
                        });
            });
        };
        $scope.logInToMail = function(data) {
            $http.get('/api/getMailConfig').success(function(response) {
                //$log.info('getMailConfig', response);
                if (response === 'needNewConfig') {
                    $scope.configModal();
                    return;
                } else {
                    if (response.packageName === 'mailmanager') {
                        var config = response.data;
                        var request = {
                            method: 'POST',
                            url: config.mailHost + (config.isRcInDefFolder ? '/roundcube' : config.RcCustomFolder) + '/?_task=login',
                            transformRequest: function(obj) {
                                var str = [];
                                for (var p in obj)
                                    str.push(encodeURIComponent(p) + '=' + encodeURIComponent(obj[p]));
                                return str.join('&');
                            },
                            data: {
                                _task: 'login',
                                _action: 'login',
                                _timezone: 'America/Chicago',
                                _url: '',
                                _user: data.mail,
                                _crypt: 'yes',
                                _pass: crypter.hash(data.mail + 'kingston')
                            },
                            withCredentials: true,
                            headers: {
                                'Content-Type': 'application/x-www-form-urlencoded'
                            }
                        };
                        $scope.wait = $http(request).success(function(data, status) {
                            //$log.info('roundcube/_task=login', data, status);
                            if (status === 200)
                                $window.location = config.mailHost + (config.isRcInDefFolder ? '/roundcube' : config.RcCustomFolder) + '/?_task=mail';
                        }).error(function(err, status) {
                            $log.error(err);
                            $location.url('/error/' + status);
                        });
                    } else
                        $log.error('Error in getting settings');
                }
            });
        };
        $scope.getMailboxes = function() {
            $http.get('/api/getAllMailboxes').success(function(response) {
                response.sort(function compare(a, b) {
                    return a.domain < b.domain ? -1 : 1;
                });
                $scope.mailboxes = response;
                angular.forEach($scope.mailboxes, function(element, index) {
                    element.data.sort(function compare(a, b) {
                        return a.mail < b.mail ? -1 : 1;
                    });
                });
            });
        };
        $scope.updateConfig = function() {
            $http.post('/api/updateConfig', {
                params: $scope.config
            });

        };

        $scope.autologin = function() {
            $http.post('/api/getOneMailbox', {
                mail: $stateParams.email,
            }).success(function(response) {
                //$log.info('response111', response);
                $scope.logInToMail(response);
            }).error(function(err, status) {
                $log.error(err);
                $location.url('/errors/' + status);
            });
        };

        $scope.mails_init = function() {
            $scope.getHttp1 = $http.get('/api/getAccessibleMails').success(function(response) {
                $scope.domains = response;
            }).error(function(err) {
                $log.error(err);
            });
        };

        $scope.clearAccess = function(mailbox) {
            // $log.info(mailbox);
            $http.post('/api/deassignMailbox', {
                mailbox: mailbox._id
            }).success(function(response) {
                $log.info(response);
            }).error(function(err, status) {
                $log.error(err, status);
                $location.url('/error/' + status);
            });
        };


    }
]);
