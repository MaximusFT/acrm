'use strict';

//Passwords service used for passwords REST endpoint
angular.module('mean.depmanager').factory('Departments', ['$resource',
    function($resource) {
        return $resource('/api/departments/:departmentId', {
            departmentId: '@_id'
        } , {
            update: {
                method: 'PUT'
            }
        });
    }
]);
