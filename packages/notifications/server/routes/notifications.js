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
                notifications.notifyOnce(sEvent, function(err) {
                    if (err)
                        console.log('Error:', err);
                }, io);
            }
        });
    }

    function processEvents(events) {
        notifications.saveEvents(events, function(err, sEvents) {
            if (err) {
                console.log('Error:', err);
            } else {
                notifications.notifyMulti(sEvents, function(err) {
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
        processEvents(events);
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

        socket.on('notifications:connect', function(user) {
            console.log(user.userName, 'online');
            socket.emit('notifications:init');
        });

        socket.on('notifications:get', function(userId) {
            socket.emit('notifications:init');
        });

        socket.on('notification:setBookmark', function(opt) {
            notifications.setNotificationState(opt);
        });

        socket.on('notification:setRead', function(opt) {
            notifications.setNotificationState(opt);
        });

        socket.on('disconnect', function() {
            console.log('<-- Notifications - user disconnected');
        });

    });

};
