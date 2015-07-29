'use strict';

angular.module('mean.canteen').config(['$stateProvider',
    function($stateProvider) {
        $stateProvider.state('canteen', {
            url: '/canteen',
            templateUrl: 'canteen/views/index.html'
        });
    }
]);
