'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Pass = mongoose.model('Pass'),
    User = mongoose.model('User'),
    NewDepartment = mongoose.model('NewDepartment'),
    _ = require('lodash');

/**
 * Create pass
 */
exports.create = function(req, res, next) {
    var pass = new Pass(req.body);
    var errors = req.validationErrors();
    //console.log(errors);
    if (errors) {
        return res.status(400).send(errors);
    }
    pass.save(function(err) {
        if (err) {
            console.log(err);
            return res.status(500).send(err);
        } else {
            var sEvent = {
                category: 0,
                code: 'passmanager::create',
                level: 'info',
                targetGroup: ['passAdmins'],
                title: 'New password for ' + pass.resourceName + ' was created.',
                link: '/#!/manager/passwords/' + pass._id,
                initPerson: req.user._id
            };
            var EventProcessor = require('meanio').events;
            EventProcessor.emit('notification', sEvent);
            return res.jsonp(pass);
        }
    });
};

/**
 * Find pass by id
 */
exports.pass = function(req, res, next, id) {
    Pass
        .findOne({
            _id: id
        })
        .exec(function(err, pass) {
            if (err)
                return next(err);
            if (!pass)
                return next(new Error('Failed to load Pass ' + id));
            req.profile = pass;
            next();
        });
};
/**
 * Update a pass
 */
exports.update = function(req, res) {
    var pair = req.body;
    var passId = req.params.passId;
    console.log('pair', pair);
    console.log('passId', passId);
    if (!pair || !passId) {
        //console.log('Empty query');
        return res.render('Empty query', {
            status: 500
        });
    } else {
        if (pair.key && (pair.key === 'forServer' || pair.key === 'forSite')) {
            var un = {};
            if (pair.key === 'forServer')
                un.forSite = '';
            if (pair.key === 'forSite')
                un.forServer = '';
            Pass
                .update({
                    _id: passId
                }, {
                    $unset: un
                }, function(err) {
                    if (err) {
                        console.log(err);
                        return res.status(500).send(err);
                    }
                });
        }
        var up = {};
        up[pair.key] = pair.val;
        Pass
            .update({
                _id: passId
            }, {
                $set: up
            })
            .exec(function(err) {
                if (err) {
                    return res.status(500).send(err);
                } else {
                    var sEvent = {
                        category: 0,
                        code: 'passmanager::update',
                        level: 'warning',
                        targetGroup: ['passAdmins'],
                        title: 'Password was modified.',
                        link: '/#!/manager/passwords/' + passId,
                        initPerson: req.user._id
                    };
                    var EventProcessor = require('meanio').events;
                    EventProcessor.emit('notification', sEvent);
                    return res.status(200).send();
                }
            });
    }
};

/**
 * Delete an pass
 */
exports.destroy = function(req, res) {
    if (req.body._id) {
        delete req.body._id;
    }
    Pass.findById(req.params.passId, function(err, pass) {
        if (err) {
            console.log(err);
            return res.status(500).send(err);
        }
        if (!pass) {
            return res.status(400).send('Bad request');
        }
        _.extend(pass, req.body);
        pass.remove(function(err) {
            if (err) {
                console.log(err);
                return res.status(500).send(err);
            } else {
                var sEvent = {
                    category: 0,
                    code: 'passmanager::destroy',
                    level: 'danger',
                    targetGroup: ['passAdmins'],
                    title: 'Password was removed from system.',
                    link: '/#!/manager/passwords',
                    initPerson: req.user._id,
                    extraInfo: pass
                };
                var EventProcessor = require('meanio').events;
                EventProcessor.emit('notification', sEvent);
                return res.status(200).send();
            }
        });
    });
};

/**
 * List of Users
 */
exports.all = function(req, res) {
    Pass.find().sort('group').exec(
        function(err, pass) {
            if (err) {
                return res.render('error', {
                    status: 500
                });
            } else {
                return res.jsonp(pass);
            }
        });
};

function nest(collection, keys) {
    if (!keys.length) {
        return collection;
    } else {
        return _(collection).groupBy(keys[0]).mapValues(function(values) {
            return nest(values, keys.slice(1));
        }).value();
    }
}

function groupBy(data) {
    return _.chain(nest(data, ['group', 'implement']))
        .pairs()
        .map(function(currentItem) {
            var implement = _.chain(currentItem[1])
                .pairs()
                .map(function(curIt) {
                    return _.object(_.zip(['implement', 'passes'], curIt));
                })
                .value();
            return _.object(_.zip(['group', 'implement'], [currentItem[0], implement]));
        })
        .value();
}

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
                    Pass.find({}, {
                        'accessedFor': 0
                    }).sort({
                        'group': 1,
                        'implement': 1,
                        'resourceName': 1,
                        'email': 1
                    }).exec(
                        function(err, pass) {
                            if (err) {
                                return res.render('error', {
                                    status: 500
                                });
                            } else {
                                var result = groupBy(pass);
                                return res.jsonp(result);
                            }
                        });
                }
                if (roles.indexOf('manager') !== -1) {
                    Pass.find({}, {
                        'group': 1,
                        'implement': 1,
                        'resourceName': 1,
                        'resourceUrl': 1
                    }).sort({
                        'group': 1,
                        'implement': 1,
                        'resourceName': 1,
                        'email': 1
                    }).exec(
                        function(err, passes) {
                            if (err) {
                                return res.render('error', {
                                    status: 500
                                });
                            } else {
                                var result = groupBy(passes);
                                return res.jsonp(result);
                            }
                        });
                }
                if (roles.indexOf('employee') !== -1) {
                    Pass.find({
                        accessedFor: {
                            $in: [req.user._id]
                        }
                    }, {
                        'accessedFor': 0
                    }).sort({
                        'group': 1,
                        'implement': 1,
                        'resourceName': 1,
                        'email': 1
                    }).exec(
                        function(err, pass) {
                            if (err) {
                                return res.render('error', {
                                    status: 500
                                });
                            } else {
                                var result = groupBy(pass);
                                return res.jsonp(result);
                            }
                        });
                }
            }
        });
};

exports.acsgroups = function(req, res) {
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
                if (roles.indexOf('manager') !== -1) {
                    User.find({
                        department: user.department
                    }, {
                        '_id': 1
                    }).exec(
                        function(err, users) {
                            if (err) {
                                res.render('error', {
                                    status: 500
                                });
                                return false;
                            } else {
                                var uids = _.map(users, '_id');
                                Pass.find({
                                        accessedFor: {
                                            $in: uids
                                        }
                                    }, {
                                        'accessedFor': 0
                                    })
                                    .exec(
                                        function(err, passes) {
                                            if (err) {
                                                return res.render('error', {
                                                    status: 500
                                                });
                                            } else {
                                                var result = groupBy(_.uniq(passes));
                                                return res.jsonp(result);
                                            }
                                        });
                            }
                        });
                }
            }
        });
};

exports.passesByGroup = function(req, res) {
    var groupId = req.query.groupId;
    Pass.find({
            group: groupId
        }, {
            'accessedFor': 0
        })
        .exec(function(err, pass) {
            if (err) {
                return res.render('error', {
                    status: 500
                });
            } else {
                //console.log(pass);
                return res.jsonp(pass);
            }
        });
};

exports.delPass = function(req, res) {
    //console.log(req);
    var passId = req.query.passId;
    if (req.body._id) {
        delete req.body._id;
    }
    Pass.findById(passId, function(err, pass) {
        //if (err) { return handleError(res, err); }
        if (!pass) {
            return res.send(404);
        }
        _.extend(pass, req.body);
        pass.remove(function(err) {
            if (err) {
                console.log(err);
                return res.status(500).send(err);
            } else {
                var sEvent = {
                    category: 0,
                    code: 'passmanager::deletePass',
                    level: 'danger',
                    targetGroup: ['passAdmins'],
                    title: 'Password was removed from system.',
                    link: '/#!/manager/passwords',
                    initPerson: req.user._id,
                    extraInfo: pass
                };
                var EventProcessor = require('meanio').events;
                EventProcessor.emit('notification', sEvent);
                return res.status(200).send();
            }
        });
    });
};

exports.getPass = function(req, res) {
    var passId = req.query.passId;
    if (passId === '') {
        res.status(400).send('Invalid URI');
        return;
    }
    User.findOne({
        _id: req.user._id
    }, {
        '_id': 1,
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
                    Pass
                        .findOne({
                            _id: passId
                        })
                        .exec(function(err, pass) {
                            if (err) {
                                return res.json(500, {
                                    error: err
                                });
                            } else {
                                return res.jsonp([pass]);
                            }
                        });
                }
                if (roles.indexOf('manager') !== -1) {
                    User
                        .find({
                            department: user.department
                        })
                        .exec(function(err, users) {
                            if (err) {
                                return res.json(500, {
                                    error: err
                                });
                            } else {
                                var uids = _.map(users, '_id');
                                Pass
                                    .findOne({
                                        $and: [{
                                            _id: passId
                                        }, {
                                            accessedFor: {
                                                $in: uids
                                            }
                                        }]
                                    })
                                    .exec(function(err, pass) {
                                        if (err) {
                                            return res.json(500, {
                                                error: err
                                            });
                                        } else {
                                            //req.profile = pass;
                                            return res.jsonp(!pass ? [] : [pass]);
                                        }
                                    });
                            }
                        });
                }
                if (roles.indexOf('employee') !== -1) {
                    Pass
                        .findOne({
                            $and: [{
                                _id: passId
                            }, {
                                accessedFor: user._id
                            }]
                        })
                        .exec(function(err, pass) {
                            if (err) {
                                console.log(err);
                                return res.json(500, {
                                    error: err
                                });
                            } else {
                                return res.jsonp(!pass ? [] : [pass]);
                            }
                        });
                }
            }
        });
};

exports.provideAccess = function(req, res) {
    if (!req.body.params || !req.body.params.passes || (!req.body.params.users && !req.body.params.deps))
        return res.status(400).send('Empty request');
    //console.log(req.body);
    var users = req.body.params.users,
        deps = req.body.params.deps,
        passes = req.body.params.passes;
    User
        .findOne({
            _id: req.user._id
        }, {
            roles: 1,
            department: 1
        }, function(err, curUser) {
            if (err) {
                console.log(err);
                return res.status(500).send(err);
            } else {
                if (curUser) {
                    if (curUser.roles.indexOf('admin') !== -1) {
                        if (users) {
                            Pass
                                .update({
                                    _id: {
                                        $in: passes
                                    }
                                }, {
                                    $addToSet: {
                                        accessedFor: {
                                            $each: users
                                        }
                                    }
                                }, {
                                    multi: true
                                })
                                .exec(function(err) {
                                    if (err) {
                                        console.log(err);
                                        return res.status(500).send();
                                    } else {
                                        var sEvents = [{
                                            category: 0,
                                            code: 'passmanager::provideAccess',
                                            level: 'info',
                                            targetPersons: users,
                                            title: 'You have been assigned access to password' + (passes.length > 1 ? 's.' : '.'),
                                            link: '/',
                                            initPerson: req.user._id
                                        }, {
                                            category: 0,
                                            code: 'passmanager::provideAccess',
                                            level: 'warning',
                                            targetGroup: ['passAdmins'],
                                            title: 'Users have been assigned access to password' + (passes.length > 1 ? 's.' : '.'),
                                            link: '/#!/manager/passwords',
                                            initPerson: req.user._id,
                                            extraInfo: users
                                        }];
                                        var EventProcessor = require('meanio').events;
                                        EventProcessor.emit('notifications', sEvents);
                                        return res.status(200).send();
                                    }
                                });
                        }
                        if (deps) {
                            User
                                .find({
                                    department: {
                                        $in: deps
                                    }
                                }, {
                                    _id: 1
                                }, function(err, users) {
                                    if (err) {
                                        console.log(err);
                                        res.status(500).send(err);
                                    } else {
                                        var uids = _.map(users, '_id');
                                        Pass
                                            .update({
                                                _id: {
                                                    $in: passes
                                                }
                                            }, {
                                                $addToSet: {
                                                    accessedFor: {
                                                        $each: uids
                                                    }
                                                }
                                            }, {
                                                multi: true
                                            }, function(err) {
                                                if (err) {
                                                    console.log(err);
                                                    return res.status(500).send(err);
                                                } else {
                                                    var sEvents = [{
                                                        category: 0,
                                                        code: 'passmanager::provideAccess',
                                                        level: 'info',
                                                        targetPersons: uids,
                                                        title: 'You have been assigned access to password' + (passes.length > 1 ? 's.' : '.'),
                                                        link: '/',
                                                        initPerson: req.user._id
                                                    }, {
                                                        category: 0,
                                                        code: 'passmanager::provideAccess',
                                                        level: 'warning',
                                                        targetGroup: ['passAdmins'],
                                                        title: 'Users have been assigned access to password' + (passes.length > 1 ? 's.' : '.'),
                                                        link: '/#!/manager/passwords',
                                                        initPerson: req.user._id,
                                                        extraInfo: uids
                                                    }];
                                                    var EventProcessor = require('meanio').events;
                                                    EventProcessor.emit('notifications', sEvents);
                                                    return res.status(200).send();
                                                }
                                            });
                                    }
                                });
                        }
                    } else if (curUser.roles.indexOf('manager') !== -1) {
                        if (users) {
                            NewDepartment
                                .find({
                                    $or: [{
                                        _id: curUser.department
                                    }, {
                                        parents: curUser.department
                                    }]
                                }, {
                                    _id: 1
                                }, function(err, departments) {
                                    if (err) {
                                        console.log(err);
                                        return res.status(500).send(err);
                                    } else {
                                        if (departments && departments.length > 0) {
                                            User
                                                .find({
                                                    $and: [{
                                                        _id: {
                                                            $in: users
                                                        }
                                                    }, {
                                                        department: {
                                                            $in: _.map(departments, '_id')
                                                        }
                                                    }]
                                                }, {
                                                    _id: 1
                                                }, function(err, verUsers) {
                                                    if (err) {
                                                        console.log(err);
                                                        return res.status(500).send(err);
                                                    } else {
                                                        console.log(verUsers);
                                                        console.log(users);
                                                        if (verUsers.length === users.length) {
                                                            Pass
                                                                .update({
                                                                    _id: {
                                                                        $in: passes
                                                                    }
                                                                }, {
                                                                    $addToSet: {
                                                                        accessedFor: {
                                                                            $each: users
                                                                        }
                                                                    }
                                                                }, {
                                                                    multi: true
                                                                })
                                                                .exec(function(err) {
                                                                    if (err) {
                                                                        console.log(err);
                                                                        return res.status(500).send();
                                                                    } else {
                                                                        var sEvents = [{
                                                                            category: 0,
                                                                            code: 'passmanager::provideAccess',
                                                                            level: 'info',
                                                                            targetPersons: users,
                                                                            title: 'You have been assigned access to password' + (passes.length > 1 ? 's.' : '.'),
                                                                            link: '/',
                                                                            initPerson: req.user._id
                                                                        }, {
                                                                            category: 0,
                                                                            code: 'passmanager::provideAccess',
                                                                            level: 'warning',
                                                                            targetGroup: ['passAdmins'],
                                                                            title: 'Users have been assigned access to password' + (passes.length > 1 ? 's.' : '.'),
                                                                            link: '/#!/manager/passwords',
                                                                            initPerson: req.user._id,
                                                                            extraInfo: users
                                                                        }];
                                                                        var EventProcessor = require('meanio').events;
                                                                        EventProcessor.emit('notifications', sEvents);
                                                                        return res.status(200).send();
                                                                    }
                                                                });
                                                        } else {
                                                            return res.status(403).send('You cannot provide access to passwords for non-subordinated persons!');
                                                        }
                                                    }
                                                });
                                        } else {
                                            return res.status(200).send();
                                        }
                                    }
                                });
                        }
                        if (deps) {
                            NewDepartment
                                .find({
                                    $and: [{
                                        _id: {
                                            $in: deps
                                        }
                                    }, {
                                        $or: [{
                                            _id: curUser.department
                                        }, {
                                            parents: curUser.department
                                        }]
                                    }]
                                }, {
                                    _id: 1
                                }, function(err, departments) {
                                    if (err) {
                                        console.log(err);
                                        return res.status(500).send(err);
                                    } else {
                                        if (deps.length === departments.length) {
                                            User
                                                .find({
                                                    department: {
                                                        $in: deps
                                                    }
                                                }, {
                                                    _id: 1
                                                }, function(err, users) {
                                                    if (err) {
                                                        console.log(err);
                                                        res.status(500).send(err);
                                                    } else {
                                                        var uids = _.map(users, '_id');
                                                        Pass
                                                            .update({
                                                                _id: {
                                                                    $in: passes
                                                                }
                                                            }, {
                                                                $addToSet: {
                                                                    accessedFor: {
                                                                        $each: uids
                                                                    }
                                                                }
                                                            }, {
                                                                multi: true
                                                            }, function(err) {
                                                                if (err) {
                                                                    console.log(err);
                                                                    return res.status(500).send(err);
                                                                } else {
                                                                    var sEvents = [{
                                                                        category: 0,
                                                                        code: 'passmanager::provideAccess',
                                                                        level: 'info',
                                                                        targetPersons: uids,
                                                                        title: 'You have been assigned access to password' + (passes.length > 1 ? 's' : '') + ' by your manager',
                                                                        link: '/',
                                                                        initPerson: req.user._id
                                                                    }, {
                                                                        category: 0,
                                                                        code: 'passmanager::provideAccess',
                                                                        level: 'warning',
                                                                        targetGroup: ['passAdmins'],
                                                                        title: 'Users have been assigned access to password' + (passes.length > 1 ? 's' : '') + ' by manager.',
                                                                        link: '/#!/manager/passwords',
                                                                        initPerson: req.user._id,
                                                                        extraInfo: uids
                                                                    }];
                                                                    var EventProcessor = require('meanio').events;
                                                                    EventProcessor.emit('notifications', sEvents);
                                                                    return res.status(200).send();
                                                                }
                                                            });
                                                    }
                                                });
                                        } else {
                                            return res.status(403).send('You cannot provite access to passwords for non-subordinated departments!');
                                        }
                                    }
                                });
                        }
                    }
                } else {
                    return res.status(401).send('Invalid user');
                }
            }
        });
};

exports.revokeAccess = function(req, res) {
    if (!req.body.params || !req.body.params.passes || !req.body.params.users)
        return res.status(400).send('Empty request');
    var users = req.body.params.users,
        passes = req.body.params.passes;
    Pass
        .update({
            _id: {
                $in: passes
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
            } else {
                var sEvents = [{
                    category: 0,
                    code: 'passmanager::revokeAccess',
                    level: 'warning',
                    targetPersons: users,
                    title: 'You have been revoked access to password' + (passes.length > 1 ? 's.' : '.'),
                    link: '/',
                    initPerson: req.user._id
                }, {
                    category: 0,
                    code: 'passmanager::revokeAccess',
                    level: 'info',
                    targetGroup: ['passAdmins'],
                    title: 'User' + (users.length > 1 ? 's have' : 'has') + ' been revoked access to password' + (passes.length > 1 ? 's.' : '.'),
                    link: '/#!/manager/passwords',
                    initPerson: req.user._id,
                    extraInfo: {
                        users: users,
                        passes: passes
                    }
                }];
                var EventProcessor = require('meanio').events;
                EventProcessor.emit('notifications', sEvents);
                return res.status(200).send();
            }
        });
};

exports.getPassesByUser = function(req, res) {
    var username = req.query.username;
    if (username === '') {
        res.status(500).send('Invalid URI');
        return;
    }
    User
        .findOne({
            username: username
        })
        .exec(function(err, user) {
            if (!user) {
                res.status(500).send('Invalid User');
                return;
            }
            User.findOne({
                _id: req.user._id
            }, {
                '_id': 0,
                'roles': 1,
                'department': 1
            }).exec(
                function(err, curuser) {
                    if (err) {
                        res.render('error', {
                            status: 500
                        });
                    } else {
                        var roles = curuser.roles;
                        if (roles.indexOf('admin') !== -1) {
                            if (JSON.stringify(curuser._id) === JSON.stringify(user._id)) {
                                Pass
                                    .find()
                                    .sort({
                                        'group': 1,
                                        'resourceName': 1,
                                        'email': 1
                                    })
                                    .exec(function(err, passes) {
                                        var result = groupBy(passes);
                                        res.jsonp(result);
                                    });
                            } else {
                                Pass
                                    .find({
                                        accessedFor: user._id
                                    })
                                    .sort({
                                        'group': 1,
                                        'resourceName': 1,
                                        'email': 1
                                    })
                                    .exec(function(err, passes) {
                                        if (err) {
                                            res.render('error', {
                                                status: 500
                                            });
                                        } else {
                                            var result = groupBy(passes);
                                            res.jsonp(result);
                                        }
                                    });
                            }
                        } else if (roles.indexOf('manager') !== -1) {
                            NewDepartment
                                .find({
                                    $or: [{
                                        _id: curuser.department
                                    }, {
                                        parents: curuser.department
                                    }]
                                }, {
                                    _id: 1
                                }, function(err, deps) {
                                    if (err) {
                                        console.log(err);
                                        return res.status(500).send(err);
                                    } else {
                                        var ret = false;
                                        _.forEach(deps, function(dep) {
                                            if (JSON.stringify(dep._id) === JSON.stringify(user.department))
                                                ret = true;
                                        });
                                        if (ret === true) {
                                            Pass
                                                .find({
                                                    accessedFor: user._id
                                                })
                                                .sort({
                                                    'group': 1,
                                                    'resourceName': 1,
                                                    'email': 1
                                                })
                                                .exec(function(err, passes) {
                                                    if (err) {
                                                        console.log(err);
                                                        res.status(500).send(err);
                                                    } else {
                                                        //console.log(passes);
                                                        var result = groupBy(passes);
                                                        return res.jsonp(result);
                                                    }
                                                });
                                        } else {
                                            return res.jsonp([]);
                                        }
                                    }
                                });
                        } else if (roles.indexOf('employee') !== -1) {
                            if (username !== req.user.username) {
                                //console.log('ne sovpalo');
                                return res.jsonp([]);
                            }
                            Pass
                                .find({
                                    accessedFor: user._id
                                })
                                .sort({
                                    group: 1,
                                    resourceName: 1,
                                    email: 1
                                })
                                .exec(function(err, passes) {
                                    if (err) {
                                        res.render('error', {
                                            status: 500
                                        });
                                    } else {
                                        var result = groupBy(passes);
                                        return res.jsonp(result);
                                    }
                                });
                        } else {
                            return res.status(403).send('Forbidden');
                        }
                    }
                });
        });
};

exports.usersWithAccess = function(req, res) {
    if (!req.body.params || !req.body.params.pass)
        return res.status(400).send('Empty query');
    Pass
        .findOne({
            _id: mongoose.Types.ObjectId(req.body.params.pass)
        }, {
            accessedFor: 1
        }, function(err, pass) {
            if (err) {
                console.log(err);
                return res.status(500).send(err);
            } else {
                if (pass) {
                    User
                        .find({
                            _id: {
                                $in: pass.accessedFor
                            }
                        }, {
                            _id: 1,
                            name: 1,
                            username: 1
                        }, function(err, users) {
                            if (err) {
                                console.log(err);
                                return res.status(500).send(err);
                            } else {
                                return res.jsonp(users);
                            }
                        });
                } else {
                    return res.status(404).send('Pass was not found');
                }
            }
        });
};

exports.denyUserAccessToPass = function(req, res) {
    if (!req.body.params || !req.body.params.user || !req.body.params.pass)
        return res.status(400).send('Empty request');
    var user = req.body.params.user,
        pass = req.body.params.pass;
    Pass
        .update({
            _id: mongoose.Types.ObjectId(pass)
        }, {
            $pull: {
                accessedFor: user
            }
        }, function(err, updated) {
            if (err) {
                console.log(err);
                return res.status(500).send(err);
            } else {
                console.log('updated', updated);
                var sEvents = [{
                    category: 0,
                    code: 'passmanager::denyUserAccessToPass',
                    level: 'warning',
                    targetPersons: [user],
                    title: 'You have been revoked access to password.',
                    link: '/',
                    initPerson: req.user._id
                }, {
                    category: 0,
                    code: 'passmanager::denyUserAccessToPass',
                    level: 'info',
                    targetGroup: ['passAdmins'],
                    title: 'User has been revoked access to password.',
                    link: '/#!/manager/passwords',
                    initPerson: req.user._id,
                    extraInfo: {
                        users: user,
                        passes: pass
                    }
                }];
                var EventProcessor = require('meanio').events;
                EventProcessor.emit('notifications', sEvents);
                return res.status(200).send();
            }
        });
};
