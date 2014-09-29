'use strict';

//Passwords service used for passwords REST endpoint
angular.module('mean.passmanager').factory('Passwords', ['$resource',
    function($resource) {
        return $resource('/api/passes/:passId', {
            passId: '@_id'
        } , {
            update: {
                method: 'PUT'
            }
        });
    }
]);
