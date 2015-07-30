'use strict';

/* jshint -W098 */
angular.module('mean.canteen').controller('CanteenController', ['$scope', '$http', '$document', '$log', '$location', 'Global', 'Canteen',
    function($scope, $http, $document, $log, $location, Global, Canteen) {
        $scope.global = Global;
        angular.element('#canteen-index-frame').height($document.height() - angular.element('ul.breadcrumb').height() - angular.element('ul.x-navigation.x-navigation-panel').height());

        $scope.$watch(function() {
            return $document.height();
        }, function(newVal) {
            angular.element('#canteen-index-frame').height(newVal - angular.element('ul.breadcrumb').height() - angular.element('ul.x-navigation.x-navigation-panel').height());
        });

        $scope.initUserData = function() {
            $http.get('/api/canteen/userData').success(function(response) {
                $log.info(response);
                $scope.frameSrc = encodeURI('https://mapqo.com/food/?name=' + response.name + '&email=' + response.email + (response.phone && response.phone !== '---' ? ('&phone=' + response.phone) : '') + (response.department && response.department.title ? ('&department=' + response.department.title) : ''));
                $log.info($scope.frameSrc);
            }).error(function(err, status) {
                $log.error(err, status);
                $location.url('/error/' + status);
            });
        };

    }
]).filter('trustAsResourceUrl', ['$sce', function($sce) {
    return function(val) {
        return $sce.trustAsResourceUrl(val);
    };
}]);
