'use strict';

var mongoose = require('mongoose'),
    NotificationGroup = mongoose.model('NotificationGroup'),
    User = mongoose.model('User'),
    NotificationSetting = mongoose.model('NotificationSetting'),
    Notification = mongoose.model('Notification'),
    async = require('async'),
    _ = require('lodash');

exports.create = function(req, res, next) {
    var nGroup = new NotificationGroup(req.body);
    nGroup.save(function(err) {
        if (err) {
            console.log(err);
            return res.status(500).send(err);
        } else {
            return res.status(200).send();
        }
    });
};

exports.delete = function(req, res) {
    if (!req.params || !req.params.nGroupId)
        return res.status(400).send('Bad request');
    NotificationGroup
        .remove({
            _id: req.params.nGroupId
        }, function(err) {
            if (err) {
                console.log(err);
                return res.status(500).send(err);
            } else
                return res.status(200).send();
        });
};

exports.update = function(req, res) {
    if (!req.body || !req.body.key || !req.body.val || !req.params.nGroupId)
        return res.status(400).send('Bad request');
    var query = {};
    query[req.body.key] = req.body.val;
    NotificationGroup
        .update({
            _id: req.params.nGroupId
        }, {
            $set: query
        }, function(err) {
            if (err) {
                console.log(err);
                return res.status(500).send(err);
            } else {
                return res.status(200).send();
            }
        });
};

exports.notificationGroups = function(req, res) {
    NotificationGroup
        .find({}, {
            assignedTo: 0
        }, function(err, notificationGroups) {
            if (err) {
                console.log(err);
                return res.status(500).send(err);
            } else
                return res.jsonp(notificationGroups);
        });
};

exports.usersInNotificationGroup = function(req, res) {
    NotificationGroup
        .findOne({
            _id: req.params.nGroupId
        }, {
            assignedTo: 1
        }, function(err, notificationGroup) {
            if (err) {
                console.log(err);
                return res.status(500).send(err);
            } else {
                if (notificationGroup && notificationGroup.assignedTo && notificationGroup.assignedTo.length) {
                    User
                        .find({
                            _id: {
                                $in: notificationGroup.assignedTo
                            }
                        }, {
                            name: 1,
                            username: 1,
                            roles: 1
                        }, function(err, users) {
                            //console.log(users);
                            if (err) {
                                console.log(err);
                                return res.status(500).send(err);
                            } else {
                                return res.jsonp(users);
                            }
                        });
                } else
                    return res.jsonp([]);
            }
        });
};

exports.assignNotificationGroup = function(req, res) {
    if (!req.body || !req.body.users)
        return res.status(400).send('Bad request');
    var users = req.body.users;
    NotificationGroup
        .update({
            _id: req.params.nGroupId
        }, {
            $addToSet: {
                assignedTo: {
                    $each: users
                }
            }
        }, function(err, updated) {
            if (err) {
                console.log(err);
                return res.status(500).send(err);
            } else {
                console.log('updated', updated);
                return res.status(200).send();
            }
        });
};

exports.notificationSettings = function(req, res) {
    if (!req.params.nGroupId)
        return res.status(400).send('Bad request');
    NotificationSetting
        .find({
            group: req.params.nGroupId
        }, {
            userOptions: 0
        }, function(err, settings) {
            if (err) {
                console.log(err);
                return res.status(500).send(err);
            } else {
                return res.jsonp(settings);
            }
        });
};

exports.postNotificationSettings = function(req, res) {
    if (!req.body.params || !req.body.params.key || !req.body.params.val || !req.body.params.nGroup || !req.body.params.nSetting)
        return res.status(400).send('Bad request');
    var key = req.body.params.key,
        val = req.body.params.val,
        nGroup = req.body.params.nGroup,
        nSetting = req.body.params.nSetting;
    console.log(key, val, nGroup, nSetting);
    if (nSetting === -1) {
        var temp = {
            group: nGroup
        };
        temp[key] = val;
        var newNSetting = new NotificationSetting(temp);
        newNSetting.save(function(err) {
            if (err) {
                console.log(err);
                return res.status(500).send(err);
            } else {
                return res.status(200).send();
            }
        });
    } else {
        var query = {};
        query[key] = val;
        NotificationSetting
            .update({
                _id: nSetting
            }, {
                $set: query
            }, function(err, updated) {
                if (err) {
                    console.log(err);
                    return res.status(500).send(err);
                } else {
                    console.log('updated', updated);
                    return res.status(200).send();
                }
            });
    }
};

exports.userNotificationsSettings = function(req, res) {
    User
        .findOne({
            _id: req.user._id
        }, {
            roles: 1
        }, function(err, currentUser) {
            if (err) {
                console.log(err);
                return res.status(500).send(err);
            } else {
                if (currentUser) {
                    NotificationGroup
                        .find({
                            $or: [{
                                assignedTo: req.user._id
                            }, {
                                name: (currentUser.roles.indexOf('admins') !== -1 ? 'admins' : 'users')
                            }]
                        }, {
                            _id: 1
                        }, function(err, groups) {
                            if (err) {
                                console.log(err);
                                return res.status(500).send(err);
                            } else {
                                //console.log(groups);
                                if (groups && groups.length) {
                                    NotificationSetting
                                        .find({
                                            group: {
                                                $in: _.map(groups, '_id')
                                            }
                                        })
                                        .populate('group', '-assignedTo')
                                        .sort({
                                            name: 1
                                        })
                                        .lean()
                                        .exec(function(err, settings) {
                                            if (err) {
                                                console.log(err);
                                                return res.status(500).send(err);
                                            } else {
                                                //return res.jsonp(settings);
                                                _.forEach(settings, function(setting) {
                                                    setting.group = setting.group.name + (setting.group.comment ? (' (' + setting.group.comment + ')') : '');
                                                    var userOption = _.filter(setting.userOptions, function(option) {
                                                        return JSON.stringify(option.user) === JSON.stringify(req.user._id);
                                                    });
                                                    if (userOption && userOption.length > 0)
                                                        setting.value = userOption[0].value;
                                                    else {
                                                        setting.value = true;
                                                        setting.def = true;
                                                    }
                                                });
                                                var result = _.chain(settings)
                                                    .groupBy('group')
                                                    .pairs()
                                                    .map(function(currentItem) {
                                                        return _.object(_.zip(['group', 'settings'], currentItem));
                                                    })
                                                    .value();
                                                return res.jsonp(result);
                                            }
                                        });
                                } else {
                                    return res.jsonp([]);
                                }
                            }
                        });
                } else
                    return res.status(404).send('User was not found');
            }
        });
};

exports.setUserNotificationSetting = function(req, res) {
    if (!req.body.params.setting || req.body.params.userOption === undefined)
        return res.status(400).send('Bad request');
    NotificationSetting
        .findOne({
            _id: req.body.params.setting
        }, {
            userOptions: 1
        }, function(err, setting) {
            if (err) {
                console.log(err);
                return res.status(500).send(err);
            } else {
                if (setting) {
                    var userOption = _.filter(setting.userOptions, function(option) {
                        return JSON.stringify(option.user) === JSON.stringify(req.user._id);
                    });
                    var query = {
                        _id: req.body.params.setting
                    };
                    var setQuery = {};
                    if (userOption && userOption.length > 0) {
                        query['userOptions.user'] = req.user._id;
                        setQuery.$set = {
                            'userOptions.$.value': req.body.params.userOption
                        };
                    } else {
                        setQuery.$addToSet = {
                            userOptions: {
                                user: req.user._id,
                                value: req.body.params.userOption
                            }
                        };
                    }
                    NotificationSetting
                        .update(query, setQuery, function(err, updated) {
                            if (err) {
                                console.log(err);
                                return res.status(500).send(err);
                            } else {
                                console.log('updated', updated);
                                return res.status(200).send();
                            }
                        });
                } else {
                    res.status(404).send('Setting was not found');
                }
            }
        });
};

exports.usersByNotificationGroups = function(req, res) {
    NotificationGroup
        .aggregate([{
            $group: {
                _id: '$name',
                users: {
                    $addToSet: '$assignedTo'
                }
            }
        }, {
            $sort: {
                _id: 1
            }
        }])
        .exec(function(err, groups) {
            if (err) {
                console.log(err);
                return res.status(500).send(err);
            } else {
                var mGroups = [];
                _.forEach(groups, function(group) {
                    group.users = _.flatten(group.users);
                    if (group.users.length)
                        mGroups.push({
                            group: group._id,
                            users: _.flatten(group.users, true)
                        });
                });
                NotificationGroup
                    .populate(mGroups, [{
                        path: 'users',
                        select: '_id name username email roles',
                        model: 'User'
                    }], function(err, pGroups) {
                        if (err) {
                            console.log(err);
                            return res.status(500).send(err);
                        } else {
                            return res.jsonp(pGroups);
                        }
                    });
            }
        });
};

exports.removeFromNGroup = function(req, res) {
    if (!req.body.user || !req.body.nGroup)
        return res.status(400).send('Bad request');
    NotificationGroup
        .update({
            name: req.body.nGroup
        }, {
            $pull: {
                assignedTo: req.body.user
            }
        }, function(err, updated) {
            if (err) {
                console.log(err);
                return res.status(500).send(err);
            } else {
                console.log('updated', updated);
                return res.status(200).send();
            }
        });
};

exports.getEventsForUser = function(req, res) {
    var N = 10,
        userId = req.user._id;
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
                notifications: uBnotifications.concat(rNotifications),
                unreadCount: generalCount
            });
        }
    ], function(err, results) {
        if (err) {
            console.log('Error while getting last notifications for user ' + userId, err);
            return res.status(500).send(err);
        } else
            return res.jsonp(results);
    });
};

exports.generalUnreadNotifications = function(req, res) {
    Notification
        .find({
            targetUser: req.user._id,
            $or: [{
                state: 0
            }, {
                state: 2
            }]
        }, {
            _id: 1
        }, function(err, forGeneralCount) {
            if (err) {
                console.log(err);
                return res.status(500).send(err);
            } else
                return res.jsonp(forGeneralCount.length);
        });
};
