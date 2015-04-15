'use strict';

var mongoose = require('mongoose'),
    SEvent = mongoose.model('SEvent'),
    User = mongoose.model('User'),
    NotificationGroup = mongoose.model('NotificationGroup'),
    Notification = mongoose.model('Notification'),
    _ = require('lodash');

exports.saveEvent = function(event, callback) {
    console.log('in saveEvent');
    var sEvent = new SEvent(event);
    sEvent.save(function(err) {
        if (err) {
            console.log(err);
            callback(err, null);
        } else {
            callback(null, sEvent);
        }
    });
};

exports.notify = function(event, callback, io) {
    console.log('in notify', event);
    if (event.targetGroup && event.targetGroup.length) {
        NotificationGroup
            .find({
                name: {
                    $in: event.targetGroup
                }
            }, {
                assignedTo: 1
            }, function(err, nGroups) {
                if (err) {
                    console.log(err);
                    callback(err);
                } else {
                    if (nGroups.length && _.flatten(_.map(nGroups, 'assignedTo')).length) {
                        var users = _.flatten(_.map(nGroups, 'assignedTo'));
                        var notifications = [];
                        _.forEach(users, function(user) {
                            notifications.push({
                                targetUser: user,
                                message: event.title,
                                category: event.category,
                                event: event._id
                            });
                        });
                        Notification
                            .create(notifications, function(err) {
                                if (err) {
                                    console.log(err);
                                    callback(err);
                                } else {
                                    _.forEach(notifications, function(notification) {
                                        io.emit('newNotification:' + notification.targetUser, notification);
                                    });
                                }
                            });
                    }
                    if (event.targetGroup.indexOf('users') !== -1) {
                        User
                            .find({
                                roles: {
                                    $ne: 'admins'
                                }
                            }, {
                                _id: 1
                            }, function(err, users) {
                                if (err) {
                                    console.log(err);
                                    callback(err);
                                } else {
                                    var notifications = [];
                                    _.forEach(users, function(user) {
                                        notifications.push({
                                            targetUser: user._id,
                                            message: event.title,
                                            category: event.category,
                                            event: event._id
                                        });
                                    });
                                    Notification
                                        .create(notifications, function(err) {
                                            if (err) {
                                                console.log(err);
                                                callback(err);
                                            } else {
                                                _.forEach(notifications, function(notification) {
                                                    io.emit('newNotification:' + notification.targetUser, notification);
                                                });
                                            }
                                        });
                                }
                            });
                    }
                    if (event.targetGroup.indexOf('admins') !== -1) {
                        User
                            .find({
                                roles: 'admins'
                            }, {
                                _id: 1
                            }, function(err, users) {
                                if (err) {
                                    console.log(err);
                                    callback(err);
                                } else {
                                    var notifications = [];
                                    _.forEach(users, function(user) {
                                        notifications.push({
                                            targetUser: user._id,
                                            message: event.title,
                                            category: event.category,
                                            event: event._id
                                        });
                                    });
                                    Notification
                                        .create(notifications, function(err) {
                                            if (err) {
                                                console.log(err);
                                                callback(err);
                                            } else {
                                                _.forEach(notifications, function(notification) {
                                                    io.emit('newNotification:' + notification.targetUser, notification);
                                                });
                                            }
                                        });
                                }
                            });
                    }
                }
            });
    } else if (event.targetPersons && event.targetPersons.length) {
        console.log(event.targetPersons);
    } else
        callback('Bad event target');
};

exports.getEventsForUser = function(io, userId) {
    if (!userId) {
        console.log('Bad request. User _id is undefined', __dirname);
        return;
    }
    var N = 10;
    User
        .findOne({
            _id: userId
        }, {
            name: 1,
            roles: 1,
            department: 1
        }, function(err, user) {
            if (err) {
                console.log(err);
                return;
            } else {
                if (user) {
                    console.log('Getting last notifications for user:', user.name);
                    Notification
                        .find({
                            targetUser: userId,
                            state: 0
                        })
                        .sort({
                            time: -1
                        })
                        .exec(function(err, unreadNotifications) {
                            if (err) {
                                console.log(err);
                                return;
                            } else {
                                if (unreadNotifications.length < N) {
                                    console.log('1');
                                    Notification
                                        .find({
                                            targetUser: userId,
                                            state: {
                                                $ne: 0
                                            }
                                        })
                                        .limit(N - unreadNotifications.length)
                                        .sort({
                                            time: -1
                                        })
                                        .exec(function(err, processedNotifications) {
                                            if (err) {
                                                console.log(err);
                                                return;
                                            } else {
                                                var notifications = unreadNotifications.concat(processedNotifications);
                                                notifications = _.sortBy(notifications, 'time');
                                                io.emit('notifications:init:' + userId, notifications);
                                            }
                                        });
                                } else {
                                    console.log('2', 'notifications:init:' + userId);
                                    io.emit('notifications:init:' + userId, unreadNotifications);
                                }
                            }
                        });
                } else {
                    console.log('User was not found', __dirname);
                }
            }
        });
};
