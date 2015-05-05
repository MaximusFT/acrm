'use strict';

var mongoose = require('mongoose'),
    SEvent = mongoose.model('SEvent'),
    User = mongoose.model('User'),
    NotificationGroup = mongoose.model('NotificationGroup'),
    Notification = mongoose.model('Notification'),
    NotificationSetting = mongoose.model('NotificationSetting'),
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

function checkUserNotificationsOptionsAndNotificate(results, io, callback) {
    var flows = [];
    _.forEach(results, function(notification) {
        if (notification) {
            flows.push(function(cb) {
                async.waterfall([
                    function(wfCallback) {
                        User
                            .findOne({
                                _id: notification.targetUser
                            }, {
                                roles: 1
                            }, function(err, curUser) {
                                if(err)
                                    wfCallback(err);
                                else
                                    wfCallback(null, curUser);
                            });
                    },
                    function(curUser, wfCallback) {
                        NotificationGroup
                            .find({
                                $or: [{
                                    assignedTo: notification.targetUser
                                }, {
                                    name: (curUser.roles.indexOf('admins') !== -1 ? 'admins' : 'users')
                                }]
                            }, {
                                _id: 1
                            }, function(err, groups) {
                                if (err)
                                    wfCallback(err);
                                else
                                    wfCallback(null, groups);
                            });
                    },
                    function(groups, wfCallback) {
                        if (groups && groups.length) {
                            NotificationSetting
                                .find({
                                    group: {
                                        $in: _.map(groups, '_id')
                                    }
                                }, {
                                    userOptions: 1,
                                    code: 1
                                }, function(err, settings) {
                                    if (err) {
                                        wfCallback(err);
                                    } else {
                                        wfCallback(null, settings);
                                    }
                                });
                        } else {
                            wfCallback(null, null);
                        }
                    },
                    function(settings, wfCallback) {
                        SEvent
                            .findOne({
                                _id: notification.event
                            }, {
                                code: 1
                            }, function(err, sEvent) {
                                if (err)
                                    wfCallback(err);
                                else {
                                    if (sEvent)
                                        wfCallback(null, settings, sEvent);
                                    else
                                        wfCallback('Event was not found');
                                }
                            });
                    },
                    function(settings, sEvent, wfCallback) {
                        if (settings) {
                            if (sEvent.code) {
                                var notificationSettings = _.filter(settings, function(setting) {
                                    return setting.code === sEvent.code;
                                });
                                if (notificationSettings.length > 0) {
                                    var userOptions = _.filter(notificationSettings[0].userOptions, function(userOption) {
                                        return JSON.stringify(userOption.user) === JSON.stringify(notification.targetUser);
                                    });
                                    if (userOptions.length > 0) {
                                        wfCallback(null, userOptions[0].value);
                                    } else
                                        wfCallback(null, true);
                                } else
                                    wfCallback(null, true);
                            } else
                                wfCallback('Event code was not found');
                        } else
                            wfCallback(null, true);
                    }
                ], function(err, result) {
                    if (err) {
                        cb(err);
                    } else {
                        // console.log('result', result);
                        if (result) {
                            io.emit('newNotification:' + notification.targetUser, notification);
                            cb(null, 'notification for user', notification.targetUser, 'was emited');
                        } else {
                            Notification
                                .update({
                                    _id: notification._id
                                }, {
                                    $set: {
                                        state: 1
                                    }
                                }, function(err, numEffected) {
                                    if(err) {
                                        cb(err);
                                    } else {
                                        cb(null, 'notification for user', notification.targetUser, 'was skipped by user options');
                                    }
                                });
                        }
                    }
                });
            });
        }
    });
    async.series(flows, function(err, results) {
        if (err)
            callback(err);
        else {
            callback(null, results.length + ' notifications were checked and processed');
        }
    });
}

function saveNotificationsAndEmitInitiation(notifications, io, callback) {
    console.log('in saveNotificationsAndEmitInitiation');
    var flows = [];
    _.forEach(notifications, function(notification) {
        flows.push(function(cb) {
            async.waterfall([
                function(wfCallback) {
                    SEvent
                        .findOne({
                            _id: notification.event
                        }, {
                            initPerson: 1
                        }, function(err, sEvent) {
                            if (err) {
                                console.log(err);
                                wfCallback(err);
                            } else {
                                if (sEvent) {
                                    wfCallback(null, sEvent.initPerson);
                                } else
                                    wfCallback('Event was not found');
                            }
                        });
                },
                function(initPerson, wfCallback) {
                    if (JSON.stringify(initPerson) !== JSON.stringify(notification.targetUser)) {
                        var notif = new Notification(notification);
                        notif.save(function(err) {
                            if (err) {
                                console.log(err);
                                wfCallback(err);
                            } else {
                                wfCallback(null, notif);
                            }
                        });
                    } else
                        wfCallback(null, null);
                }
            ], function(err, result) {
                if (err)
                    cb(err);
                else
                    cb(null, result);
            });
        });
    });
    async.series(flows, function(err, results) {
        if (err) {
            // console.log(err);
            callback(err);
        } else {
            // console.log('results', results);
            checkUserNotificationsOptionsAndNotificate(results, io, callback);
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
                                                if (event.initPerson && event.initPerson !== user || !event.initPerson)
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
                        if (event.initPerson && event.initPerson !== targetPerson || !event.initPerson) {
                            notifications.push({
                                targetUser: targetPerson,
                                event: event._id,
                                message: message,
                            });
                            cb(null, message);
                        }
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

exports.getEventsForUser = function(userId, mainCallback) {
    if (!userId) {
        console.log('Bad request. User _id is undefined', __dirname);
        return;
    }
    var N = 10;
    async.waterfall([
        function(callback) {
            User
                .findOne({
                    _id: userId
                }, {
                    name: 1,
                    roles: 1,
                    department: 1
                }, function(err, user) {
                    if (err)
                        callback(err);
                    else {
                        if (user)
                            callback(null);
                        else {
                            console.log('Getting last notifications for user:', user.name);
                            callback('User was not found: ' + __dirname);
                        }
                    }
                });
        },
        function(callback) {
            Notification
                .find({
                    targetUser: userId,
                    $or: [{
                        state: 0
                    }, {
                        state: 2
                    }]
                }, {
                    _id: 1
                }, function(err, forGeneralCount) {
                    if (err)
                        callback(err);
                    else
                        callback(null, forGeneralCount.length);
                });
        },
        function(generalCount, callback) {
            Notification
                .find({
                    targetUser: userId,
                    $or: [{
                        state: 0
                    }, {
                        state: 2
                    }]
                }, {
                    targetUser: 0
                })
                .populate('event', '-targetGroup -targetPersons -extraInfo -initPerson -initGroup')
                .sort({
                    'event.whenEmited': -1
                })
                .limit(N)
                .exec(function(err, uBnotifications) {
                    if (err)
                        callback(err);
                    else {
                        callback(null, uBnotifications, generalCount);
                    }
                });
        },
        function(uBnotifications, generalCount, callback) {
            Notification
                .find({
                    targetUser: userId,
                    $and: [{
                        state: {
                            $ne: 0
                        }
                    }, {
                        state: {
                            $ne: 2
                        }
                    }]
                })
                .populate('event', '-targetGroup -targetPersons -extraInfo -initPerson -initGroup')
                .sort({
                    'event.whenEmited': -1
                })
                .limit((N - uBnotifications.length) <= 0 ? 0 : (N - uBnotifications.length))
                .exec(function(err, rNotifications) {
                    if (err)
                        callback(err);
                    else {
                        callback(null, uBnotifications, generalCount, rNotifications);
                    }
                });
        },
        function(uBnotifications, generalCount, rNotifications, callback) {
            callback(null, {
                notifications: _.map(uBnotifications.concat(rNotifications), '_id'),
                unreadCount: generalCount
            });
        }
    ], function(err, results) {
        if (err)
            console.log('Error while getting last notifications for user ' + userId, err);
        else
            mainCallback(null, results);
    });
};

exports.setNotificationState = function(opt) {
    if (opt && opt.state && opt.notification) {
        Notification
            .update({
                _id: opt.notification
            }, {
                $set: {
                    state: opt.state
                }
            }, function(err, updated) {
                if (err) {
                    console.log(err);
                } else {
                    console.log('updated', updated);
                }
            });
    }
};
