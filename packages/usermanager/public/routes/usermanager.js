'use strict';

angular.module('mean.usermanager').config(['$stateProvider',
    function($stateProvider) {
        $stateProvider
            .state('users', {
                url: '/users',
                templateUrl: 'usermanager/views/users.html'
            })
            .state('user', {
                url: '/users/:username',
                templateUrl: 'usermanager/views/user.html'
            });
    }
]);
