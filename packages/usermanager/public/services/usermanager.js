'use strict';

angular.module('mean.usermanager').factory('Users1', ['$resource',
    function($resource) {
        return $resource('/api/users/:userId', {
            userId: '@_id'
        }, {
            update: {
                method: 'PUT'
            }
        });
    }
]);
