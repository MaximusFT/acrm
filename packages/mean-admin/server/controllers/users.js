'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    User = mongoose.model('User');

exports.isAdmin = function(req, res) {
    User
        .findOne({
            _id: req.user._id
        }, function(err, user) {
            if (err) {
                console.log(err);
                return res.status(500).send(err);
            } else
            if (user) {
                return res.jsonp({
                    isAdmin: user.roles.indexOf('admin') !== -1
                });
            } else {
                return res.send(500).send('Invalid user');
            }
        });
};

exports.getMode = function(req, res) {
    User
        .findOne({
            _id: req.user._id
        }, {
            roles: 1
        }, function(err, user) {
            if (err) {
                console.log(err);
                return res.status(500).send(err);
            } else {
                if (user) {
                    var mode;
                    if (user.roles.indexOf('admin') !== -1)
                        mode = 777;
                    else if (user.roles.indexOf('manager') !== -1)
                        mode = 770;
                    else if (user.roles.indexOf('employee') !== -1)
                        mode = 700;
                    else
                        mode = 0;
                    return res.jsonp(mode);
                } else {
                    return res.status(401).send('Invalid user');
                }
            }
        });
};
