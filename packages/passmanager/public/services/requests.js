'use strict';

//Passwords service used for passwords REST endpoint
angular.module('mean.passmanager').factory('Requests', ['$resource',
    function($resource) {
        return $resource('/api/requests/:requestId', {
            requestId: '@_id'
        } , {
            update: {
                method: 'PUT'
            }
        });
    }
]);
