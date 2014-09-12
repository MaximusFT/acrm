'use strict';

//Users service used for users REST endpoint
angular.module('mean.manager').factory('Users', ['$resource',
    function($resource) {
        return $resource('/manager/users/:userId', {
            userId: '@_id'
        }, {
            update: {
                method: 'PUT'
            }
        });
    }
]);
