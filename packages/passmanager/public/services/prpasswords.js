'use strict';

//Passwords service used for passwords REST endpoint
angular.module('mean.passmanager').factory('PrPasswords', ['$resource',
    function($resource) {
        return $resource('/api/prpasses/:passId', {
            passId: '@_id'
        } , {
            update: {
                method: 'PUT'
            }
        });
    }
]);
