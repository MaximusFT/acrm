'use strict';

angular.module('mean.clients').controller('ClientsController', ['$scope', '$http', '$location', '$log', 'Global', 'Clients', 'modalService',
    function($scope, $http, $location, $log, Global, Clients, modalService) {
        $scope.global = Global;
        $scope.maxSize = 5;
        $scope.filterOptions = {};
        $scope.count1 = $scope.count2 = $scope.count3 = $scope.count4 = $scope.curPage1 = $scope.curPage2 = $scope.curPage3 = $scope.curPage4 = 1;
        $scope.dateOptions = {
            formatYear: 'yy',
            startingDay: 1
        };
        $scope.isOpen = [];
        $scope.status = {};
        $scope.status.isDdOpen = [];
        $scope.isResShown = [];
        $scope.isCategoryActive = [];

        $scope.oldWebreqSchema = [{
            title: 'Webrequest ID',
            schemaKey: 'webreq_inside_id',
            type: 'text',
            inTable: true
        }, {
            title: 'From',
            schemaKey: 'form_address',
            type: 'comment',
            inTable: true
        }, {
            title: 'Date',
            schemaKey: 'creation_date',
            type: 'text',
            inTable: true
        }, {
            title: 'Name',
            schemaKey: 'lastname',
            type: 'text',
            inTable: true
        }, {
            title: 'Request type',
            schemaKey: 'webreq_type',
            type: 'text',
            inTable: true
        }, {
            title: 'Office ID',
            schemaKey: 'office_destination',
            type: 'text',
            inTable: true
        }, {
            title: 'Comment',
            schemaKey: 'comment',
            type: 'text',
            inTable: true
        }];

        $scope.webreqSchema = [{
            title: 'Name',
            schemaKey: 'name',
            type: 'text'
        }, {
            title: 'Email',
            schemaKey: 'email',
            type: 'text'
        }, {
            title: 'Phone',
            schemaKey: 'phone',
            type: 'text'
        }, {
            title: 'Type',
            schemaKey: 'type',
            type: 'text'
        }, {
            title: 'From form',
            schemaKey: 'fromForm',
            type: 'text'
        }, {
            title: 'Comment',
            schemaKey: 'comment',
            type: 'text'
        }, {
            title: 'Created',
            schemaKey: 'created',
            type: 'date'
        }];

        $scope.reportSchema = [{
            title: 'Form',
            schemaKey: 'form',
            type: 'object'
        }, {
            title: 'Data',
            schemaKey: 'formData',
            type: 'object'
        }, {
            title: 'Analytics',
            schemaKey: 'analyticsData',
            type: 'object'
        }, {
            title: 'Actions',
            schemaKey: 'actionsPerformed',
            type: 'object'
        }, {
            title: 'When processed',
            schemaKey: 'whenProcessed',
            type: 'date'
        }];

        $scope.logSchema = [{
            title: 'URI',
            schemaKey: 'uri',
            type: 'text'
        }, {
            title: 'Form ID',
            schemaKey: 'form',
            type: 'text'
        }, {
            title: 'Form data',
            schemaKey: 'formData',
            type: 'object'
        }, {
            title: 'IP (1)',
            schemaKey: 'ip1',
            type: 'text'
        }, {
            title: 'IP (2)',
            schemaKey: 'ip2',
            type: 'text'
        }, {
            title: 'Browser',
            schemaKey: 'browser',
            type: 'object'
        }, {
            title: 'Time',
            schemaKey: 'time',
            type: 'date'
        }];

        $scope.filters = [{
            title: 'Department',
            key: 'department',
            type: 'select'
        }, {
            title: 'Type',
            key: 'type',
            type: 'select'
        }, {
            title: 'Name',
            key: 'name',
            type: 'text'
        }, {
            title: 'Email',
            key: 'email',
            type: 'text'
        }, {
            title: 'Phone',
            key: 'phone',
            type: 'text'
        }, {
            title: 'State',
            key: 'state',
            type: 'select'
        }, {
            title: 'Date',
            key: 'date',
            type: 'date_period'
        }];

        $scope.states = [{
            title: 'Unprocessed',
            id: 0
        }, {
            title: 'Processed',
            id: 1
        }, {
            title: 'Spam',
            id: 2
        }, {
            title: 'Removed',
            id: -1
        }, {
            title: 'Test',
            id: 3
        }, {
            title: 'All',
            id: -11
        }];

        $scope.init = function(curPage) {
            $scope.curPage1 = curPage;
            if (JSON.stringify($scope.filterOptions) === '{}') {
                $scope.getHttp1 = $http.get('/api/webreqs', {
                    params: {
                        curPage: curPage
                    }
                }).success(function(data) {
                    //$log.info('init', data);
                    $scope.webreqs = data.webreqs;
                    $scope.count1 = data.count;
                    if (data.allUnreadCount)
                        $scope.unreadCount = data.allUnreadCount;
                    $scope.unreadTestCount = data.testUnreadCount;
                }).error(function(err, status) {
                    $log.error(err);
                    $location.url('/error/' + status);
                });
            } else
                $scope.applyFilters(curPage);
        };

        $scope.initOldRequests = function(curPage) {
            $scope.getHttp2 = $http.get('/api/oldWebreqs', {
                params: {
                    curPage: curPage
                }
            }).success(function(data) {
                //$log.info(data);
                $scope.oldWebreqs = data.webreqs;
                $scope.count2 = data.count;
            }).error(function(err, status) {
                $log.error(err);
                $location.url('/error/' + status);
            });
        };

        $scope.initReports = function(curPage) {
            $scope.getHttp5 = $http.get('/api/webreqs/reports', {
                params: {
                    curPage: curPage
                }
            }).success(function(response) {
                //$log.info(response);
                $scope.reports = response.reports;
                $scope.count3 = response.count;
            }).error(function(err, status) {
                $log.error(err);
                $location.url('/error/' + status);
            });
        };

        $scope.formatDate = function(date) {
            return new Date(date).toLocaleString();
        };

        $scope.initDeps = function() {
            $scope.getHttp3 = $http.get('/api/getNewDeps').success(function(response) {
                $scope.departments = response;
                $scope.departments.splice(0, 1);
            });
        };

        $scope.initTypes = function() {
            $scope.getHttp4 = $http.get('/api/acrmRequestTypes').success(function(response) {
                $scope.types = response;
            });
        };

        $scope.openDatepicker = function($event, index) {
            $event.preventDefault();
            $event.stopPropagation();
            $scope.isOpen[index] = true;
        };

        $scope.getToday = function() {
            return new Date().getFullYear() + '-' + ((new Date()).getMonth() + 1) + '-' + (new Date()).getDate();
        };

        $scope.applyFilters = function(curPage) {
            //$log.info($scope.filterOptions, typeof $scope.filterOptions);
            $scope.webreqs = [];
            $scope.curPage1 = curPage ? curPage : 1;
            $scope.getHttp1 = $http.post('/api/applyFilters', {
                params: {
                    curPage: $scope.curPage1,
                    options: $scope.filterOptions
                }
            }).success(function(response) {
                //$log.info('applyFilters', response);
                $scope.webreqs = response.webreqs;
                $scope.count1 = response.count;
                if ($scope.filterOptions.state === 0 && response.allUnreadCount)
                    $scope.unreadCount = response.allUnreadCount;
                $scope.unreadTestCount = response.testUnreadCount;
            }).error(function(err, status) {
                $log.error(err);
                $location.url('/error/' + status);
            });
        };

        $scope.toggleDropdown = function($event, index) {
            $event.preventDefault();
            $event.stopPropagation();
            $scope.status.isDdOpen[index] = !$scope.status.isDdOpen[index];
        };

        $scope.checkAs = function(webreq, state) {
            //$log.info(webreq, state);
            $scope.getHttp1 = $http.put('/api/changeWebreqState/' + webreq._id, {
                params: {
                    state: state
                }
            }).success(function() {
                $scope.status.isDdOpen = [];
                $scope.applyFilters($scope.curPage1);
            }).error(function(err, status) {
                $log.error(err);
                $location.url('/error/' + status);
            });
        };

        $scope.showRes = function(repIndex, index, action) {
            if (!$scope.isResShown[repIndex])
                $scope.isResShown[repIndex] = [];
            $scope.isResShown[repIndex][index] = !$scope.isResShown[repIndex][index];
            if (action.action === 'ACRM' && !$scope.hasError(action)) {
                var modalOptions = {
                    closeButtonText: 'Ok',
                    //actionButtonText: 'Ok',
                    headerText: 'Request from internet',
                    bodyText: 'There are request details.',
                    type: 12,
                    webreq: $scope.reports[repIndex].actionsPerformed[index].res
                };
                modalService.showModal({}, modalOptions);
            }
        };

        $scope.selectCategory = function(id, index) {
            $scope.isCategoryActive = [];
            $scope.isCategoryActive[index] = true;
            $scope.filterOptions = {
                state: id
            };
            $scope.applyFilters();
        };

        $scope.showReport = function(webreqId) {
            $scope.getHttp5 = $http.get('/api/reportForWebreq/' + webreqId).success(function(response) {
                if (response) {
                    var modalOptions = {
                        closeButtonText: 'Ok',
                        //actionButtonText: 'Ok',
                        headerText: 'Report for request',
                        bodyText: 'There are report details.',
                        type: 13,
                        report: response
                    };
                    modalService.showModal({}, modalOptions);
                }
            }).error(function(err, status) {
                $log.error(err);
                $location.url('/error/' + status);
            });
        };

        $scope.briefString = function(str) {
            return str.length > 17 ? str.substring(0, 17).trim() + '...' : str;
        };

        $scope.hasError = function(action) {
            if (action.action === 'ACRM') {
                return !!action.error;
            }
            if (action.action === 'Inside') {
                return action.res.indexOf('formCallback') !== -1 && action.res.indexOf('error') !== -1;
            }
            if (action.action === 'Justclick') {
                return action.res.error_code !== 0;
            }
            if (action.action === 'SMS') {
                return action.res.RESPONSE && action.res.RESPONSE.status && typeof action.res.RESPONSE.status === 'object' && action.res.RESPONSE.status.length > 0 && action.res.RESPONSE.status[0] !== '1';
            }
        };

        $scope.initLogs = function(curPage) {
            $scope.getHttp6 = $http.get('/api/logsRequest', {
                params: {
                    curPage: curPage
                }
            }).success(function(response) {
                $log.info(response);
                $scope.logs = response.logs;
                $scope.count4 = response.count;
            }).error(function(err, status) {
                $log.error(err);
                $location.url('/error/' + status);
            });
        };
    }
]);
