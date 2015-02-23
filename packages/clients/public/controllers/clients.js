'use strict';

angular.module('mean.clients').controller('ClientsController', ['$scope', '$http', '$log', 'Global', 'Clients', 'modalService',
    function($scope, $http, $log, Global, Clients, modalService) {
        $scope.global = Global;
        $scope.maxSize = 5;
        $scope.filterOptions = {};
        $scope.count1 = $scope.count2 = $scope.count3 = $scope.curPage1 = $scope.curPage2 = $scope.curPage3 = 1;
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
            title: 'From form',
            schemaKey: 'fromForm',
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
            title: 'Actions',
            schemaKey: 'actionsPerformed',
            type: 'object'
        }, {
            title: 'When processed',
            schemaKey: 'whenProcessed',
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
            if (JSON.stringify($scope.filterOptions) === '{}') {
                $scope.getHttp1 = $http.get('/api/webreqs', {
                    params: {
                        curPage: curPage
                    }
                }).success(function(data) {
                    //$log.info(data);
                    $scope.webreqs = data.webreqs;
                    $scope.count1 = data.count;
                }).error(function(err) {
                    $log.error(err);
                });
            } else
                $scope.applyFilters();
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
            }).error(function(err) {
                $log.error(err);
            });
        };

        $scope.initReports = function(curPage) {
            $scope.getHttp5 = $http.get('/api/webreqs/reports', {
                params: {
                    curPage: curPage
                }
            }).success(function(response) {
                $log.info(response);
                $scope.reports = response.reports;
                $scope.count3 = response.count;
            }).error(function(err) {
                $log.error(err);
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

        $scope.applyFilters = function() {
            //$log.info($scope.filterOptions, typeof $scope.filterOptions);
            $scope.getHttp1 = $http.post('/api/applyFilters', {
                params: {
                    options: $scope.filterOptions
                }
            }).success(function(response) {
                $scope.webreqs = response.webreqs;
                $scope.count1 = response.count;
            }).error(function(err) {
                $log.error(err);
            });
        };

        $scope.toggleDropdown = function($event, index) {
            $event.preventDefault();
            $event.stopPropagation();
            $scope.status.isDdOpen[index] = !$scope.status.isDdOpen[index];
        };

        $scope.checkAs = function(webreq, state) {
            $log.info(webreq, state);
            $scope.getHttp1 = $http.put('/api/changeWebreqState/' + webreq._id, {
                params: {
                    state: state
                }
            }).success(function(response) {
                $scope.webreqs = response.webreqs;
                $scope.count1 = response.count;
                $scope.status.isDdOpen = [];
            }).error(function(err) {
                $log.error(err);
            });
        };

        $scope.showRes = function(repIndex, index, action) {
            if (!$scope.isResShown[repIndex])
                $scope.isResShown[repIndex] = [];
            $scope.isResShown[repIndex][index] = !$scope.isResShown[repIndex][index];
            if (action === 'ACRM') {
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
    }
]);
