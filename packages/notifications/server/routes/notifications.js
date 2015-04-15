'use strict';

/* jshint -W098 */
module.exports = function(Notifications, io) {
    var _ = require('lodash'),
        notifications = require('../controllers/notifications'),
        EventProcessor = require('meanio').events;

    //event processor handler
    function processEvent(event) {
        notifications.saveEvent(event, function(err, sEvent) {
            if (err) {
                console.log('Error:', err);
            } else {
                notifications.notify(sEvent, function(err) {
                    if (err)
                        console.log('Error:', err);
                }, io);
            }
        });
    }

    //event emitter handler from all server processors
    //--several events
    EventProcessor.on('notifications', function(events) {
        console.log('events catched', events);
        _.forEach(events, function(event) {
            processEvent(event);
        });
    });

    //--one event
    EventProcessor.on('notification', function(event) {
        console.log('event catched', event);
        processEvent(event);
    });

    //Notifications Socket.IO mechanism
    io.on('connection', function(socket) {
        console.log('--> One more user connected to notifications');
        socket.emit('connected');
        
        socket.on('notifications:connect', function(userId) {
            console.log(userId, 'online');
            notifications.getEventsForUser(io, userId);
        });

        socket.on('notifications:get', function(userId) {
            notifications.getEventsForUser(io, userId);
        });

        socket.on('disconnect', function() {
            console.log('Notifications - user disconnected');
        });

    });

};
