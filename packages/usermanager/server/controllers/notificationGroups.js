'use strict';

var mongoose = require('mongoose'),
    NotificationGroup = mongoose.model('NotificationGroup'),
    User = mongoose.model('User'),
    NotificationSetting = mongoose.model('NotificationSetting'),
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
    NotificationGroup
        .find({
            assignedTo: req.user._id
        }, {
            _id: 1
        }, function(err, groups) {
            if (err) {
                console.log(err);
                return res.status(500).send(err);
            } else {
                console.log(groups);
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
