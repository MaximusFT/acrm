'use strict';

var Module = require('meanio').Module,
    Notifications = new Module('notifications');

Notifications.register(function(app, auth, database, http) {

    var io = require('./server/config/socketio')(http);
    Notifications.io = io;
    Notifications.routes(io);

    Notifications.aggregateAsset('css', 'notifications.css');

    return Notifications;
});
