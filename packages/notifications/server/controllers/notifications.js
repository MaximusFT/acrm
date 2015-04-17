'use strict';

var mongoose = require('mongoose'),
    SEvent = mongoose.model('SEvent'),
    User = mongoose.model('User'),
    NotificationGroup = mongoose.model('NotificationGroup'),
    Notification = mongoose.model('Notification'),
    _ = require('lodash'),
    async = require('async');

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

exports.saveEvents = function(events, callback) {
    console.log('in saveEvents');
    var flows = [];
    _.forEach(events, function(event) {
        flows.push(function(cb) {
            var sEvent = new SEvent(event);
            sEvent.save(function(err) {
                if (err) {
                    console.log(err);
                    cb(err, null);
                } else {
                    cb(null, sEvent);
                }
            });
        });
    });
    async.series(flows, function(err, results) {
        if (err) {
            callback(err);
        } else {
            //console.log('results', results);
            callback(null, results);
        }
    });
};

function ucfirst(str) {
    var firstLetter = str.substr(0, 1);
    return firstLetter.toUpperCase() + str.substr(1);
}

function getInitiatorName(event, cb) {
    if (event.initPerson) {
        User
            .findOne({
                _id: event.initPerson
            }, {
                name: 1
            }, function(err, initPerson) {
                if (err) {
                    console.log(err);
                    cb(err);
                } else {
                    if (initPerson && initPerson.name)
                        cb(null, ucfirst(initPerson.name));
                    else
                        cb('Init person was not found');
                }
            });
    } else if (event.initGroup) {
        cb(null, 'Notification from ' + event.initGroup + '.');
    } else
        cb('Wrong init person/group info');
}

function actionPlusContext(event, cb) {
    var msg = '';
    if (event.extraInfo) {
        if (event.extraInfo.actionName)
            msg += event.extraInfo.actionName + ':';
        if (event.extraInfo.clean)
            msg += ' ' + event.extraInfo.clean;
        if (event.extraInfo.context) {
            if (event.extraInfo.context.model && event.extraInfo.context.field && event.extraInfo.context._id) {
                mongoose.model(event.context.model)
                    .findOne({
                        _id: event.extraInfo.context._id
                    }, function(err, context) {
                        if (err) {
                            console.log(err);
                            return cb(err);
                        } else {
                            if (context && context[event.extraInfo.context.field]) {
                                msg += ' ' + context[event.extraInfo.context.field];
                                return cb(null, msg);
                            } else
                                return cb('Context object/property was not found');
                        }
                    });
            } else
                return cb('Wrong context parameters');
        } else {
            return cb(null, msg);
        }
    } else {
        return cb(null, msg);
    }
}

function buildNotificationMessage(event, callback) {
    var message = '';

    getInitiatorName(event, function(err, initiatorName) {
        if (err) {
            callback(err);
        } else {
            message += initiatorName + ' ';
            actionPlusContext(event, function(err, actionWithContext) {
                if (err) {
                    callback(err);
                } else {
                    message += actionWithContext;
                    console.log(message);
                    callback(null, message);
                }
            });
        }
    });

}

function saveNotificationsAndEmitInitiation(notifications, io, callback) {
    console.log('in saveNotificationsAndEmitInitiation');
    var flows = [];
    _.forEach(notifications, function(notification) {
        flows.push(function(cb) {
            var notif = new Notification(notification);
            notif.save(function(err) {
                if (err) {
                    console.log(err);
                    cb(err);
                } else {
                    cb(null, notif);
                }
            });
        });
    });
    async.series(flows, function(err, results) {
        if (err) {
            console.log(err);
            callback(err);
        } else {
            console.log('results', results);
            _.forEach(results, function(notification) {
                io.emit('newNotification:' + notification.targetUser, notification);
            });
            callback(null, results.length + ' notifications emited');
        }
    });
}

function notify(event, callback, io) {
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
                        var flows = [];
                        _.forEach(users, function(user) {
                            flows.push(function(cb) {
                                buildNotificationMessage(event, function(err, message) {
                                    if (err) {
                                        cb(err);
                                    } else {
                                        notifications.push({
                                            targetUser: user,
                                            event: event._id,
                                            message: message,
                                        });
                                        cb(null, message);
                                    }
                                });
                            });
                        });
                        async.series(flows, function(err, results) {
                            if (err) {
                                console.log('Error occured while notifications were building for broadcast sending', err);
                            } else {
                                console.log('results', results);
                                saveNotificationsAndEmitInitiation(notifications, io, callback);
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
                                        buildNotificationMessage(event, function(err, message) {
                                            if (err) {
                                                console.log('Error occured while notifications were building for broadcast sending');
                                                return;
                                            } else {
                                                notifications.push({
                                                    targetUser: user._id,
                                                    title: event.title,
                                                    message: event.title,
                                                    category: event.category,
                                                    event: event._id
                                                });
                                            }
                                        });
                                    });
                                    saveNotificationsAndEmitInitiation(notifications, io, callback);
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
                                        buildNotificationMessage(event, function(err, message) {
                                            if (err) {
                                                console.log('Error occured while notifications were building for broadcast sending');
                                                return;
                                            } else {
                                                notifications.push({
                                                    targetUser: user._id,
                                                    title: event.title,
                                                    message: event.title,
                                                    category: event.category,
                                                    event: event._id
                                                });
                                            }
                                        });
                                    });
                                    saveNotificationsAndEmitInitiation(notifications, io, callback);
                                }
                            });
                    }
                }
            });
    } else if (event.targetPersons && event.targetPersons.length) {
        var flows = [],
            notifications = [];
        _.forEach(event.targetPersons, function(targetPerson) {
            flows.push(function(cb) {
                buildNotificationMessage(event, function(err, message) {
                    if (err) {
                        cb(err);
                    } else {
                        notifications.push({
                            targetUser: targetPerson,
                            event: event._id,
                            message: message,
                        });
                        cb(null, message);
                    }
                });
            });
        });
        async.series(flows, function(err, results) {
            if (err) {
                console.log('Error occured while notifications were building for broadcast sending', err);
            } else {
                console.log('results', results);
                saveNotificationsAndEmitInitiation(notifications, io, callback);
            }
        });
    } else
        callback('Bad event target');
}

exports.notifyOnce = function(event, callback, io) {
    notify(event, callback, io);
};

exports.notifyMulti = function(events, callback, io) {
    var flows = [];
    _.forEach(events, function(event) {
        flows.push(function(cb) {
            notify(event, function(err, sEvent) {
                if (err) {
                    console.log('Error:', err);
                    cb(err);
                } else {
                    cb(null, sEvent);
                }
            }, io);
        });
    });
    async.series(flows, function(err, results) {
        if (err) {
            console.log(err);
        } else {
            console.log('results', results);
        }
    });
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
                        }, {
                            _id: 1
                        }, function(err, forGeneralCount) {
                            if (err) {
                                console.log(err);
                                return;
                            } else {
                                Notification
                                    .find({
                                        targetUser: userId,
                                        state: 0
                                    }, {
                                        targetUser: 0
                                    })
                                    .populate('event', '-targetGroup -targetPersons -extraInfo -initPerson -initGroup')
                                    .sort({
                                        'event.whenEmited': -1
                                    })
                                    .limit(10)
                                    .exec(function(err, unreadNotifications) {
                                        if (err) {
                                            console.log(err);
                                            return;
                                        } else {
                                            if (unreadNotifications.length < N) {
                                                console.log('1');
                                                console.log('unreadNotifications', unreadNotifications);
                                                Notification
                                                    .find({
                                                        targetUser: userId,
                                                        state: {
                                                            $ne: 0
                                                        }
                                                    })
                                                    .populate('event', '-targetGroup -targetPersons -extraInfo -initPerson -initGroup')
                                                    .limit(N - unreadNotifications.length)
                                                    .sort({
                                                        'event.whenEmited': -1
                                                    })
                                                    .exec(function(err, processedNotifications) {
                                                        if (err) {
                                                            console.log(err);
                                                            return;
                                                        } else {
                                                            console.log('processedNotifications', processedNotifications);
                                                            var notifications = unreadNotifications.concat(processedNotifications);
                                                            notifications = _.sortBy(notifications, 'time');
                                                            console.log('1', 'notifications:init:' + userId, notifications.length);
                                                            io.emit('notifications:init:' + userId, {
                                                                notifications: notifications,
                                                                unreadCount: forGeneralCount.length
                                                            });
                                                        }
                                                    });
                                            } else {
                                                console.log('2', 'notifications:init:' + userId, unreadNotifications.length);
                                                io.emit('notifications:init:' + userId, {
                                                    notifications: unreadNotifications,
                                                    unreadCount: forGeneralCount.length
                                                });
                                            }
                                        }
                                    });
                            }
                        });
                } else {
                    console.log('User was not found', __dirname);
                }
            }
        });
};
