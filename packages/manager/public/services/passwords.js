'use strict';

//Passwords service used for passwords REST endpoint
angular.module('mean.passwords').factory('Passwords', ['$resource',
    function($resource) {
        return $resource('/api/passes/:passId', {
            passId: '@_id'
        }, {
            update: {
                method: 'PUT'
            }
        });
    }
]);
