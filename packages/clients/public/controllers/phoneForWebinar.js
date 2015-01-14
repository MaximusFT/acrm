'use strict';

angular.module('mean.clients').controller('PhonesForWebinarController', ['$scope', '$http', '$log', '$location', 'Global', 'Clients',
    function($scope, $http, $log, $location, Global, Clients) {
        $scope.global = Global;

        $http.get('/api/checkAccessFeature', {
            params: {
                href: $location.path()
            }
        }).success(function(data) {
            $scope.isAccess = true;
        }).error(function(err) {
            $log.error(err);
            $location.path('/');
        });

        $scope.webreqSchema = [
            /*{
                                title : 'Webrequest ID',
                                schemaKey : 'webreq_inside_id',
                                type : 'text',
                                inTable : true
                            }, {
                                title : 'Date',
                                schemaKey : 'creation_date',
                                type : 'text',
                                inTable : true
                            }, {
                                title : 'Last name',
                                schemaKey : 'lastname',
                                type : 'text',
                                inTable : true
                            }, {
                                title : 'First name',
                                schemaKey : 'firstname',
                                type : 'text',
                                inTable : true
                            }, {
                                title : 'Middle name',
                                schemaKey : 'middlename',
                                type : 'text',
                                inTable : true
                            }, {
                                title : 'Request type',
                                schemaKey : 'webreq_type',
                                type : 'text',
                                inTable : true
                            }, {
                                title : 'Office ID',
                                schemaKey : 'office_destination',
                                type : 'text',
                                inTable : true
                            }, {
                                title : 'Comment',
                                schemaKey : 'comment',
                                type : 'text',
                                inTable : true
                            }, {
                                title : 'Form',
                                schemaKey : 'form_address',
                                type : 'text',
                                inTable : true
                            }, {
                                title : 'Referer',
                                schemaKey : 'link_source',
                                type : 'text',
                                inTable : true
                            }, {
                                title : 'Target page',
                                schemaKey : 'target_page',
                                type : 'text',
                                inTable : true
                            }*/
            {
                title: 'Phone',
                schemaKey: 'phone',
                type: 'text',
                inTable: true
            }
        ];

        $scope.dateOptions = {
            formatYear: 'yy',
            startingDay: 1
        };

        $scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
        $scope.format = $scope.formats[0];
        $scope.maxdate = new Date().toJSON().slice(0, 10);

        $scope.init = function(day, month, year) {
            $scope.getHttp1 = null;
            $scope.getHttp1 = $http.get('api/phonesForWebinars', {
                params: {
                    day: day,
                    month: month,
                    year: year
                }
            }).success(function(data) {
                //$log.info(data);
                $scope.webreqs = data;
                $scope.phones = data.map(function(req) {
                    return req.phone;
                }).join('; ');
            }).error(function() {
                $log.error('error');
            });
        };

        $scope.formatDate = function(date) {
            return new Date(date).toLocaleString();
        };

        $scope.disabled = function(date, mode) {
            return (mode === 'day' && (date.getDay() === 0 || date.getDay() === 6));
        };

        $scope.open = function($event) {
            $event.preventDefault();
            $event.stopPropagation();

            $scope.opened = true;
        };

        $scope.$watch('dt', function() {
            if ($scope.dt) {
                var date = $scope.formatDate($scope.dt);
                if (date.split(',').length !== 2)
                    return;
                date = date.split(',')[0];
                if (date.split('.').length !== 3)
                    return;
                date = date.split('.');
                $scope.init(date[0], date[1], date[2]);
            }
        });
    }
]);
