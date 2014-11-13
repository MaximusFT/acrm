'use strict';

angular.module('mean.support').factory('Tickets', ['$resource',
    function($resource) {
        return $resource('/api/tickets/:ticketId', {
            ticketId: '@_id'
        } , {
            update: {
                method: 'PUT'
            }
        });
    }
]);
