'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    Pass = mongoose.model('Pass'),
    NewDepartment = mongoose.model('NewDepartment'),
    _ = require('lodash');

/**
 * Create user
 */
exports.create = function(req, res, next) {
    var tmp = req.body;
    User
        .findOne({
            _id: req.user._id
        })
        //.populate('department')
        .exec(function(err, curuser) {
            if (err) {
                return res.status(400).send(err);
            } else {
                if (curuser.roles.indexOf('manager') !== -1) {
                    tmp.department = curuser.department;
                }
            }
        });
    var user = new User(tmp);
    user.provider = 'local';

    // because we set our user.provider to local our models/user.js validation will always be true
    req.assert('email', 'You must enter a valid email address').isEmail();
    req.assert('password', 'Password must be between 8-20 characters long').len(8, 20);
    req.assert('username', 'Username cannot be more than 20 characters').len(1, 20);
    req.assert('confirmPassword', 'Passwords do not match').equals(req.body.password);

    var errors = req.validationErrors();
    console.log(errors);
    if (errors) {
        return res.status(400).send(errors);
    }

    // Hard coded for now. Will address this with the user permissions system in v0.3.5
    //user.roles = ['authenticated'];
    user.roles = req.body.roles;
    user.save(function(err) {
        if (err) {
            console.log(err);
            switch (err.code) {
                case 11000:
                case 11001:
                    res.status(400).send('Username already taken');
                    break;
                default:
                    res.status(400).send('Please fill all the required fields');
            }
            console.log(err);
            return res.status(400);
        }
        res.jsonp(user);
    });
};

/**
 * Find user by id
 */
exports.user = function(req, res, next, id) {
    User
        .findOne({
            _id: id
        })
        .exec(function(err, user) {
            if (err)
                return next(err);
            if (!user)
                return next(new Error('Failed to load User ' + id));
            req.profile = user;
            next();
        });
};
/**
 * Update a user
 */
exports.update = function(req, res) {
    var pair = req.body;
    var userId = req.params.userId;
    if (!pair || !userId) {
        //console.log('Empty query');
        return res.render('Empty query', {
            status: 500
        });
    } else {
        var up = {};
        up[pair.key] = pair.val;
        User
            .update({
                _id: userId
            }, {
                $set: up
            })
            .exec(function(err) {
                if (err) {
                    return res.json(500, {
                        error: err
                    });
                } else {
                    return res.jsonp('ok');
                }
            });
    }
};

/**
 * Delete an user
 */
exports.destroy = function(req, res) {
    if (!req.params.userId)
        return res.status(500).send('Empty query');
    User
        .remove({
            _id: req.params.userId
        }, function(err, deleted) {
            if (err) {
                console.log(err);
                return res.status(500).send(err);
            } else {
                console.log(deleted);
                return res.status(200).send();
            }
        });
};

exports.removeUsers = function(req, res) {
    if (!req.body.params || !req.body.params.users)
        return res.status(500).send('Empty query');
    var users = req.body.params.users;
    User
        .remove({
            _id: {
                $in: users
            }
        }, function(err, deleted) {
            if (err) {
                console.log(err);
                return res.status(500).send(err);
            } else {
                console.log('deleted', deleted);
                return res.status(200).send();
            }
        });
};

/**
 * List of Users
 */
exports.all = function(req, res) {
    User.find().sort('-created').populate('user', 'name username').exec(function(err, users) {
        if (err) {
            res.render('error', {
                status: 500
            });
        } else {
            res.jsonp(users);
        }
    });
};

exports.getUser = function(req, res) {
    User.findOne({
        _id: req.user._id
    }, {
        roles: 1,
        department: 1
    }, function(err, curUser) {
        if (err) {
            console.log(err);
            res.status(500).send(err);
        } else {
            if (curUser.roles.indexOf('admin') !== -1) {
                User
                    .findOne({
                        username: req.query.username
                    }, {
                        hashed_password: 0,
                        salt: 0,
                        __v: 0,
                        provider: 0
                    })
                    .populate('department', '-parents -__v')
                    .exec(function(err, user) {
                        if (err) {
                            return res.render('error', {
                                status: 500
                            });
                        } else {
                            if (!user)
                                return res.jsonp('empty');
                            else
                                return res.jsonp(user);
                        }
                    });
            } else if (curUser.roles.indexOf('manager') !== -1 || curUser.roles.indexOf('employee') !== -1) {
                NewDepartment
                    .find({
                        $or: [{
                            parents: curUser.department
                        }, {
                            _id: curUser.department
                        }]
                    }, function(err, deps) {
                        if (err) {
                            console.log(err);
                            return res.status(500).send(err);
                        } else {
                            if (deps) {
                                //console.log(_.map(deps, '_id'));
                                User
                                    .findOne({
                                        username: req.query.username,
                                        department: {
                                            $in: _.map(deps, '_id')
                                        }
                                    })
                                    .populate('department')
                                    .exec(function(err, user) {
                                        if (err) {
                                            console.log(err);
                                            return res.status(500).send(err);
                                        } else {
                                            //console.log(user);
                                            return res.jsonp(user);
                                        }
                                    });
                            } else {
                                return res.jsonp([]);
                            }
                        }
                    });
            } else {
                return res.status(403).send('Forbidden');
            }
        }
    });
};

exports.department = function(req, res) {
    var department = req.query.department;
    User.find({
            'department': department
        },
        function(err, user) {
            if (err) {
                res.render('error', {
                    status: 500
                });
            } else {
                res.jsonp(user);
            }
        });
};

exports.searchUsers = function(req, res) {
    if (!req.query.value)
        return res.status(500).send('Empty query');
    var val = req.query.value;
    User
        .findOne({
            _id: req.user._id
        }, {
            _id: 0,
            department: 1,
            roles: 1
        }, function(err, user) {
            if (err) {
                console.log(err);
                return res.status(500).send(err);
            } else {
                var roles = user.roles;
                if (roles.indexOf('admin') !== -1) {
                    User
                        .find({}, {
                            name: 1,
                            email: 1,
                            username: 1,
                            department: 1
                        })
                        .or([{
                            name: {
                                $regex: new RegExp(val, 'i')
                            }
                        }, {
                            email: {
                                $regex: new RegExp(val, 'i')
                            }
                        }, {
                            username: {
                                $regex: new RegExp(val, 'i')
                            }
                        }])
                        .lean()
                        .populate('department')
                        .exec(function(err, users) {
                            if (err) {
                                res.render('error', {
                                    status: 500
                                });
                            } else {
                                _(users).forEach(function(u, uid) {
                                    if (u.department && u.department.title)
                                        u.department = u.department.title;
                                    if (uid === users.length - 1)
                                        return res.jsonp(users);
                                });
                            }
                        });
                }
                if (roles.indexOf('manager') !== -1) {
                    NewDepartment
                        .find({
                            $or: [{
                                _id: user.department
                            }, {
                                parents: user.department
                            }]
                        }, {
                            _id: 1
                        }, function(err, departments) {
                            if (err) {
                                console.log(err);
                                return res.status(500).send(err);
                            } else {
                                User
                                    .find({
                                        department: {
                                            $in: _.map(departments, '_id')
                                        }
                                    }, {
                                        name: 1,
                                        email: 1,
                                        username: 1,
                                        department: 1
                                    })
                                    .or([{
                                        name: {
                                            $regex: val
                                        }
                                    }, {
                                        email: {
                                            $regex: val
                                        }
                                    }, {
                                        username: {
                                            $regex: val
                                        }
                                    }])
                                    .lean()
                                    .populate('department')
                                    .exec(function(err, users) {
                                        if (err) {
                                            console.log(err);
                                            return res.status(500).send(err);
                                        } else {
                                            _(users).forEach(function(u, uid) {
                                                u.department = u.department.name;
                                                if (uid === users.length - 1)
                                                    return res.jsonp(users);
                                            });
                                        }
                                    });
                            }
                        });
                }
                if (roles.indexOf('employee') !== -1) {
                    return res.status(403).send('Access denied');
                }
            }
        });
};

exports.assignRole = function(req, res) {
    //console.log(req.body);
    if (!req.body.params || !req.body.params.users || !req.body.params.role)
        return res.status(500).send('Empty query');
    var users = req.body.params.users,
        roles = ['authenticated'],
        role = req.body.params.role === 1 ? 'admin' : (req.body.params.role === 2 ? 'manager' : (req.body.params.role === 3 ? 'employee' : ''));
    if (role)
        roles.push(role);
    else
        return res.status(500).send('Unknown role');
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
                    if (user.roles.indexOf('manager') !== -1 && role === 'admin')
                        return res.status(403).send('Access denied');
                    User
                        .update({
                            _id: {
                                $in: users
                            }
                        }, {
                            $set: {
                                roles: roles
                            }
                        }, {
                            multi: true
                        })
                        .exec(function(err, updated) {
                            if (err) {
                                console.log(err);
                                return res.status(500).send(err);
                            } else {
                                console.log('updated', updated);
                                return res.jsonp(role);
                            }
                        });
                } else {
                    return res.status(401).send('Invalid user');
                }
            }
        });
};

exports.clearAccesses = function(req, res) {
    if (!req.body.params || !req.body.params.users)
        return res.status(500).send('empty request');
    var users = req.body.params.users;
    Pass
        .update({
            accessedFor: {
                $in: users
            }
        }, {
            $pullAll: {
                accessedFor: users
            }
        }, {
            multi: true
        })
        .exec(function(err) {
            if (err) {
                console.log(err);
                return res.status(500).send(err);
            } else
                return res.status(200).send();
        });
};

exports.getForHead = function(req, res) {
    User
        .findOne({
            _id: req.user._id
        }, function(err, user) {
            if (err) {
                console.log(err);
                return res.status(500).send(err);
            } else {
                if (user && user.roles && user.roles.indexOf('admin') !== -1) {
                    User
                        .find({}, {
                            name: 1
                        }, function(err, users) {
                            if (err) {
                                console.log(err);
                                return res.status(500).send(err);
                            } else {
                                return res.jsonp(users);
                            }
                        });
                } else if (user && user.roles && user.roles.indexOf('manager') !== -1) {
                    NewDepartment
                        .find({
                            $or: [{
                                parents: mongoose.Types.ObjectId(user.department)
                            }, {
                                _id: user.department
                            }]
                        }, {
                            _id: 1
                        }, function(err, departments) {
                            if (err) {
                                console.log(err);
                                return res.status(500).send(err);
                            } else {
                                var deps = _.map(departments, '_id');
                                User
                                    .find({
                                        department: {
                                            $in: deps
                                        }
                                    }, {
                                        name: 1
                                    }, function(err, users) {
                                        if (err) {
                                            console.log(err);
                                            return res.status(500).send(err);
                                        } else {
                                            return res.jsonp(users);
                                        }
                                    });
                            }
                        });
                } else {
                    return res.status(403).send('Access denied');
                }
            }
        });
};
