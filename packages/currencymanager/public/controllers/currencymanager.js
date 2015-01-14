'use strict';

angular.module('mean.currencymanager').controller('CurrencymanagerController', ['$scope', '$log', '$http', '$location', 'Global', 'Currencymanager',
    function($scope, $log, $http, $location, Global, Currencymanager) {
        $scope.global = Global;

        $scope.colCount = $scope.rowCount = 0;

        //$scope.cols = ['Доллар США', 'Евро', 'Рос. рубль', 'Нефть', 'Золото', 'Доллар/Евро'];
        $scope.rows = [];
        $scope.cols = [];

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

        $scope.init = function() {
            $http.get('/api/getCurrencyPredictions').success(function(data) {
                //$log.info(data);
                if (data && data.rows && data.cols) {
                    $scope.rows = data.rows;
                    $scope.rowCount = data.rows.length;
                    $scope.cols = data.cols;
                    $scope.colCount = data.cols.length;
                }
            });
        };

        $scope.save = function() {
            //$log.info($scope.row, $scope.cols);
            $http.post('/api/saveCurrencyPredictions', {
                params: {
                    cols: $scope.cols,
                    rows: $scope.rows
                }
            });
        };

        $scope.getNumber = function(num) {
            return new Array(num);
        };

        $scope.$watch('colCount', function() {
            if (!$scope.rows[$scope.rowCount - 1])
                $scope.rows[$scope.rowCount - 1] = [];
            if (!$scope.rows[$scope.rowCount - 1][$scope.colCount - 1])
                $scope.rows[$scope.rowCount - 1][$scope.colCount - 1] = '---';
        });

        $scope.$watch('rowCount', function() {
            if (!$scope.rows[$scope.rowCount - 1])
                $scope.rows[$scope.rowCount - 1] = [];
        });
    }
]);
