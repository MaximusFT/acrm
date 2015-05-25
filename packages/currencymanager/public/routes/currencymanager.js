'use strict';

angular.module('mean.currencymanager').config(['$stateProvider',
    function($stateProvider) {
        $stateProvider.state('currencymanager page', {
            url: '/manager/currency',
            templateUrl: 'currencymanager/views/index.html'
        }).state('mail sender', {
        	url: '/mail-sender',
        	templateUrl: 'currencymanager/views/mailSender.html'
        });
    }
]);
