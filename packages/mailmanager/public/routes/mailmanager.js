'use strict';

angular.module('mean.mailmanager').config(['$stateProvider',
    function($stateProvider) {
        $stateProvider.state('mailmanager', {
            url: '/mailmanager',
            templateUrl: 'mailmanager/views/index.html'
        }).state('mail autologin', {
            url: '/mailmanager/:email',
            templateUrl: 'mailmanager/views/emailAutologin.html'
        }).state('mail', {
        	url: '/mail/u',
        	templateUrl: 'mailmanager/views/mail.html'
        });
    }
]);
