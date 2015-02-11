'use strict';

/* jshint -W098 */
angular.module('mean.mailmanager').controller('MailmanagerController', ['$scope', '$window', '$http', '$log', 'Global', 'Mailmanager', 'crypter',
    function($scope, $window, $http, $log, Global, Mailmanager, crypter) {
        $scope.global = Global;
        $scope.package = {
            name: 'mailmanager'
        };
        $scope.mailServerUrl = 'http://rez.mailgroup.pro/';
        $scope.oneAtATime = true;
        $scope.mailboxes = [];
        $scope.domains = [];
        $scope.isSomeSelected = true;
        $scope.isMailSelected = [];
        $scope.tempdomain = '';
        $scope.domainAddState = false;
        $scope.mailboxTemp = {
            title: '',
            // password: '',
            domain: '',
            state: 1,
            comment: '',
            created: Date.now,
            mail: '',
            delated: 'false'

        };

        $scope.checkMail = function(sectionIndex, index, mail) {
            //$log.info('mail', $scope.isMailSelected);

            if (!$scope.isMailSelected[sectionIndex])
                $scope.isMailSelected[sectionIndex] = [];
            if (mail.Selected === false)
                $scope.isMailSelected[sectionIndex][index] = false;
            if (mail.Selected === true)
                $scope.isMailSelected[sectionIndex][index] = true;
             $scope.isSomeSelected = checkSelections();
        };
        function checkSelections() {
                // var ret = false;
                // isMailSelected.forEach(function (group) {
                //     angular.forEach(group, function (impl) {
                //         angular.forEach(impl, function (pass) {
                //             if (pass === true)
                //                 ret = true;
                //         });
                //     });
                // });
                // return !ret;
            }

        $scope.domainAddShow = function() {
            $scope.domainAddState = true;

        };
        $scope.domainAddShow = function() {
            $scope.domainAddState = true;

        };
        $scope.domainAdd = function() {
            $scope.domainAddState = true;
            $scope.domains.push($scope.tempdomain);
        };
        $scope.getDomains = function() {
            $http.get('/getdomlist').success(function(response) {
                // $log.info(response);
                response.forEach(function(element, index, array) {
                    $scope.domains.push(element);
                });
                //$log.info($scope.domains);
                // $scope.domains = response;
            });
            // $scope.domains = ['123','321','312'];
            // return $scope.domains;
        };
        $scope.logInToMail = function(data) {
            var request = {
                method: 'POST',
                url: $scope.mailServerUrl + 'roundcube/?_task=login',
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
                    $window.location = $scope.mailServerUrl + 'roundcube/?_task=mail';

            }).error(function(data, status) {
                $log.info('Error with getting response');
            });


        };



        $scope.mailboxAdd = function() {
            $http.post('/mailboxAdd', {
                params: $scope.mailboxTemp
            });

        };
        $scope.getMailboxes = function() {
            $http.get('/getmailboxes').success(function(response) {
                $scope.mailboxes = response;
                // $log.info(response);
            });
        };
        $scope.synchronizemailboxes = function() {
            $http.get('/synchronizemailboxes').success(function(response, status) {
                $log.info(response);
                $log.info(status);

            });
        };
        $scope.dbto = function() {
            $http.post('/dbto', {
                // params : {
                params: $scope.mailboxTemp
                    // }


                // $http.get('/dbto').success(function(response) {
                //   $log.info(response);
            });
        };
        $scope.changeId = function(index) {
            if ($scope.fromdb[index].state === true)
                $scope.fromdb[index].state = false;
            else
                $scope.fromdb[index].state = true;
            checkState();
        };

        function foreach(value, index, ar) {
            if (value.state === true)
                $scope.list.push($scope.fromdb[index]._id);
        }

        function checkState() {
            $scope.list = [];
            $scope.fromdb.forEach(foreach);
            return $scope.list;
        }
        $scope.dbfrom = function() {
            $http.get('/dbfrom').success(function(response) {

                $scope.fromdb = response;
                $scope.fromdb.fields = Object.keys(response[0]);
                $log.info(response);
            });
        };
        $scope.dbdel = function() {
            $http.post('/dbdel', {
                params: $scope.list
            }).success(function(response) {
                $log.info(response);
            });
        };
        $scope.status = {
            isFirstOpen: true,
            isFirstDisabled: false
        };
    }
]);
