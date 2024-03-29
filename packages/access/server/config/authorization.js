'use strict';

var mongoose = require('mongoose'),
    User = mongoose.model('User');
//_ = require('lodash');

/**
 * Generic require login routing middleware
 */
exports.requiresLogin = function(req, res, next) {
    if (!req.user)
        return res.status(401).send('User is not authorized');
    User
        .findOne({
            _id: req.user._id
        }, function(err, user) {
            if (err) {
                console.log(err);
                return res.status(500).send(err);
            } else {
                if (user)
                    next();
                else
                    return res.status(500).send('Invalid user');
            }
        });
};

/**
 * Generic require Admin routing middleware
 * Basic Role checking - future release with full permission system
 */
exports.requiresAdmin = function(req, res, next) {
    if (!req.user)
        return res.status(401).send('User is not authorized');
    User
        .findOne({
            _id: mongoose.Types.ObjectId(req.user._id)
        }, function(err, user) {
            if (err) {
                console.log(err);
                return res.status(500).send(err);
            } else {
                if (user) {
                    if (user.roles && user.roles.indexOf('admin') === -1)
                        return res.status(403).send('Access denied');
                    next();
                } else {
                    return res.status(500).send('Invalid user');
                }
            }
        });
};

exports.requiresAdminAndKostya = function(req, res, next) {
    if (!req.user)
        return res.status(401).send('User is not authorized');
    User
        .findOne({
            _id: mongoose.Types.ObjectId(req.user._id)
        }, function(err, user) {
            if (err) {
                console.log(err);
                return res.status(500).send(err);
            } else {
                if(user) {
                    if(user.roles && user.roles.indexOf('admin') === -1 && JSON.stringify(user._id) !== JSON.stringify(mongoose.Types.ObjectId('5593f8bb9987a6e472b07b17')) && JSON.stringify(user._id) !== JSON.stringify(mongoose.Types.ObjectId('55924accf81db7130c719d1b')))
                        return res.status(403).send('Access denied');
                    next();
                } else {
                    return res.status(500).send('Invalid user');
                }
            }
        });
};

exports.requiresManager = function(req, res, next) {
    if (!req.user)
        return res.status(401).send('User is not authorized');
    User
        .findOne({
            _id: mongoose.Types.ObjectId(req.user._id)
        }, function(err, user) {
            if (err) {
                console.log(err);
                return res.status(500).send(err);
            } else {
                if (user) {
                    if (user.roles && user.roles.indexOf('admin') === -1 && user.roles.indexOf('manager') === -1)
                        return res.status(403).send('Access denied');
                    next();
                } else {
                    return res.status(500).send('Invalid user');
                }
            }
        });
};
