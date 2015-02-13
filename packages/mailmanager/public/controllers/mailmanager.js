'use strict';

/* jshint -W098 */
angular.module('mean.mailmanager').controller('MailmanagerController', ['$scope', '$window', '$http', '$log', 'Global', 'Mailmanager', 'modalService', 'crypter',
    function($scope, $window, $http, $log, Global, Mailmanager, modalService, crypter) {
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
                                _timezone: '_default_',
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
                            if (status === 200)
                                $window.open((config.mailHost + (config.isRcInDefFolder ? '/roundcube' : config.RcCustomFolder) + '/?_task=mail'), '_blank');

                        }).error(function(data, status) {
                            $log.info('Error with getting response');
                        });
                    } else
                        $log.info('Error in getting settings');
                }

            });
        };
        $scope.getMailboxes = function() {
            $http.get('/api/getAllMailboxes').success(function(response) {
                $scope.mailboxes = response;
            });
        };
        $scope.synchronizemailboxes = function() {
            $http.get('/api/synchronizemailboxes').success(function(response, status) {
                $log.info('synchronized');
            });
        };
        $scope.updateConfig = function() {
            $log.info($scope.config);
            $http.post('/api/updateConfig', {
                params: $scope.config
            });

        };
        $scope.status = {
            isFirstOpen: true,
            isFirstDisabled: false
        };
    }
]);
