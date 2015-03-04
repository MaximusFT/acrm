'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    Pass = mongoose.model('Pass'),
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
    var user = req.profile;

    user.remove(function(err) {
        if (err) {
            res.render('error', {
                status: 500
            });
        } else {
            res.jsonp(user);
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

exports.groups = function(req, res) {
    User.findOne({
        _id: req.user._id
    }, {
        '_id': 0,
        'department': 1,
        'roles': 1
    }).exec(
        function(err, user) {
            if (err) {
                res.render('error', {
                    status: 500
                });
            } else {
                var roles = user.roles;
                if (roles.indexOf('admin') !== -1) {
                    User.find({}).sort({
                            'department': 1,
                            'name': 1,
                            'username': 1
                        })
                        .populate('department')
                        .lean()
                        .exec(
                            function(err, user) {
                                if (err) {
                                    res.render('error', {
                                        status: 500
                                    });
                                } else {
                                    _(user).forEach(function(u) {
                                        if(u.department && u.name)
                                            u.department = u.department.name;
                                        if (u.roles && u.roles.length > 1)
                                            u.roles = u.roles[1].substring(0, 1).toUpperCase();
                                        else
                                            u.roles = 'N/v';
                                    });
                                    var result = _.chain(user)
                                        .groupBy('department')
                                        .pairs()
                                        .map(function(currentItem) {
                                            return _.object(_.zip(['department', 'users'], currentItem));
                                        })
                                        .value();
                                    res.jsonp(result);
                                }
                            });
                }
                if (roles.indexOf('manager') !== -1 || roles.indexOf('employee') !== -1) {
                    User.find({
                            department: user.department
                        }).sort({
                            'department': 1,
                            'name': 1,
                            'username': 1
                        })
                        .populate('department')
                        .lean()
                        .exec(
                            function(err, users) {
                                if (err) {
                                    res.render('error', {
                                        status: 500
                                    });
                                } else {
                                    _(users).forEach(function(u) {
                                        u.department = u.department.name;
                                        if (u.roles && u.roles.length > 1)
                                            u.roles = u.roles[1].substring(0, 1).toUpperCase();
                                        else
                                            u.roles = 'N/v';
                                    });

                                    var result = _.chain(users)
                                        .groupBy('department')
                                        .pairs()
                                        .map(function(currentItem) {
                                            return _.object(_.zip(['department', 'users'], currentItem));
                                        })
                                        .value();
                                    res.jsonp(result);
                                }
                            });
                }
            }
        });
};

exports.getUser = function(req, res) {
    User.findOne({
        _id: req.user._id
    }, {
        'roles': 1,
        'department': 1
    }, function(err, curUser) {
        if (err) {
            res.render('error', {
                status: 500
            });
        } else {
            if (curUser.roles.indexOf('admin') !== -1) {
                User
                    .findOne({
                        'username': req.query.userId
                    })
                    .populate('department')
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
                User
                    .findOne({
                        'username': req.query.userId,
                        'department': curUser.department
                    })
                    .populate('department')
                    .exec(function(err, user) {
                        if (err) {
                            return res.render('error', {
                                status: 500
                            });
                        } else {
                            return res.jsonp(user);
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
    var val = req.query.value;

    User.findOne({
        _id: req.user._id
    }, {
        '_id': 0,
        'department': 1,
        'roles': 1
    }).exec(
        function(err, user) {
            if (err) {
                res.render('error', {
                    status: 500
                });
            } else {
                var roles = user.roles;
                if (roles.indexOf('admin') !== -1) {

                    User.find({}, {
                            'name': 1,
                            'email': 1,
                            'username': 1,
                            'department': 1
                        })
                        .or([{
                            'name': {
                                '$regex': new RegExp(val, 'i')
                            }
                        }, {
                            'email': {
                                '$regex': new RegExp(val, 'i')
                            }
                        }, {
                            'username': {
                                '$regex': new RegExp(val, 'i')
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
                                    u.department = u.department.name;
                                    if (uid === users.length - 1)
                                        return res.jsonp(users);
                                });
                            }
                        });
                }
                if (roles.indexOf('manager') !== -1) {
                    User.find({
                            department: user.department
                        }, {
                            'name': 1,
                            'email': 1,
                            'username': 1,
                            'department': 1
                        })
                        .or([{
                            'name': {
                                '$regex': val
                            }
                        }, {
                            'email': {
                                '$regex': val
                            }
                        }, {
                            'username': {
                                '$regex': val
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
                                    u.department = u.department.name;
                                    if (uid === users.length - 1)
                                        return res.jsonp(users);
                                });
                            }
                        });
                }
                if (roles.indexOf('employee') !== -1) {
                    return res.jsonp('permission denied');
                }
            }
        });
};

exports.assignRole = function(req, res) {
    var users = req.body.users;
    var role = req.body.role === 1 ? 'admin' : (req.body.role === 2 ? 'manager' : (req.body.role === 3 ? 'employee' : ''));
    User
        .update({
            _id: {
                $in: users
            }
        }, {
            $set: {
                roles: ['authenticated', role]
            }
        }, {
            multi: true
        })
        .exec(function(err) {
            if (err) {
                return res.json(500, {
                    error: err
                });
            }
            return res.jsonp(role);
        });
};

exports.bindToDep = function(req, res) {
    if (!req.body.users || !req.body.users.length || !req.body.dep)
        return res.status(500).send('Empty request');
    var users = req.body.users;
    var dep = req.body.dep;
    User
        .update({
            _id: {
                $in: users
            }
        }, {
            $set: {
                department: dep
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

exports.clearAccesses = function(req, res) {
    var users = req.body.users;
    if (!users) {
        return res.jsonp(500, {
            error: 'empty request'
        });
    }
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
                return res.json(500, {
                    error: err
                });
            }
            res.jsonp('ok');
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
                } else {
                    return res.status(403).send('Access denied');
                }
            }
        });
};
