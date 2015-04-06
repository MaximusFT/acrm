'use strict';

var mongoose = require('mongoose'),
    SEvent = mongoose.model('SEvent'),
    User = mongoose.model('User'),
    _ = require('lodash');

exports.saveEvent = function(event, callback) {
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

exports.emitEvent = function(io, event) {
    if (event.targetType === 0) {
        //group event
        io.emit('notification:' + event.target, event);
    } else if (event.targetType === 1) {
        //user(s) event
        _.forEach(event.target, function(target) {
            io.emit('notification:' + target, event);
        });
    } else {
        console.log('Unknown event target type');
    }
};

exports.initEventsForUser = function(io, userId) {
    if (!userId) {
        console.log('Bad request. User _id is undefined', __dirname);
        return;
    }
    User
        .findOne({
            _id: userId
        }, {
            roles: 1,
            department: 1
        }, function(err, user) {
            if (err) {
                console.log(err);
                return;
            } else {
                console.log('user', user, __dirname);
                if (user) {
                    var query = {
                        $or: [{
                            targetType: 1,
                            target: user._id
                        }, {
                            targetType: 0,
                            target: user.roles.indexOf('admin') !== -1 ? 'admins' : 'users'
                        }]
                    };
                    SEvent
                        .find(query)
                        .sort({
                            whenEmited: -1
                        })
                        .exec(function(err, events) {
                            if (err) {
                                console.log(err);
                                return;
                            } else {
                                io.emit('notifications:init:' + userId, events);
                            }
                        });
                } else {
                    console.log('User was not found', __dirname);
                }
            }
        });
};
