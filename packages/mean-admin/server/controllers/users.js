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
