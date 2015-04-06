'use strict';

/* jshint -W098 */
// The Package is past automatically as first parameter
module.exports = function(Notifications, io) {
    var _ = require('lodash'),
        notifications = require('../controllers/notifications'),
        EventProcessor = require('meanio').events;

    EventProcessor.on('notification', function(event) {
        console.log('event catched', event);
        notifications.saveEvent(event, function(err, sEvent) {
            if(!err) {
                notifications.emitEvent(io, sEvent);
            }
        });
    });

    io.on('connection', function(socket) {
        console.log('Notifications - user connected');
        socket.emit('connected');

        socket.on('disconnect', function() {
            console.log('Notifications - user disconnected');
        });

        socket.on('notifications:on', function(user) {
            console.log(user.name, 'online');
            notifications.initEventsForUser(io, user._id);
        });


    });

};
