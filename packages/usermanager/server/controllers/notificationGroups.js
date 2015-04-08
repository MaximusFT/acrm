'use strict';

var mongoose = require('mongoose'),
    NotificationGroup = mongoose.model('NotificationGroup'),
    User = mongoose.model('User');

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
                        	console.log(users);
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
            _id: req.params.respId
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
                return res.status(200).send();
            }
        });
};
