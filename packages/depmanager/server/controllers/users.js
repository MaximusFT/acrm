'use strict';

var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    NewDepartment = mongoose.model('NewDepartment'),
    _ = require('lodash');

function searchTree(tree, matchingId, cb) {
    var ret = null;
    //console.log('searching ', matchingId, ' in tree ', tree);
    _.forEach(tree, function(element) {
        if (JSON.stringify(element.id) === JSON.stringify(matchingId)) {
            //console.log('match!!', element);
            ret = element;
            cb(ret);
        } else if (element.items !== null) {
            var result = null;
            for (var i = 0; !result && i < element.items.length; i += 1) {
                //console.log('jump down');
                result = searchTree([element.items[i]], matchingId, cb);
            }
            ret = result;
            cb(ret);
        }
    });
}

function createTree(departments) {
    departments = _.sortBy(departments, 'level');
    var tree = [];
    _.forEach(new Array(departments[departments.length - 1].level + 1), function(t, index) {
        var result = _.filter(departments, function(dep) {
            return dep.level === index;
        });
        if (index === departments[0].level) {
            _.forEach(result, function(department) {
                tree.push({
                    id: department._id,
                    title: department.title,
                    head: department.head,
                    level: department.level,
                    items: []
                });
            });
        } else {
            _.forEach(result, function(department) {
                searchTree(tree, department.parents[department.parents.length - 1], function(node) {
                    //console.log('found', node);
                    if (node && node.items)
                        node.items.push({
                            id: department._id,
                            title: department.title,
                            head: department.head,
                            items: []
                        });
                });
            });
        }
    });
    return tree;
}

exports.usersByDepartment = function(req, res) {
    if (!req.params.department)
        return res.status(400).send('Empty request');
    User
        .find({
            department: req.params.department
        }, function(err, directUsers) {
            if (err) {
                console.log(err);
                return res.status(500).send(err);
            } else {
                NewDepartment
                    .find({
                        parents: mongoose.Types.ObjectId(req.params.department)
                    })
                    .populate('head', '-department -hashed_password -provider -roles -salt -__v')
                    .exec(function(err, dependDeps) {
                        if (err) {
                            console.log(err);
                            return res.status(500).send(err);
                        } else {
                            return res.jsonp({
                                directUsers: directUsers,
                                dependDeps: _.sortBy(dependDeps, 'level'),
                                tree: dependDeps.length ? createTree(dependDeps) : []
                            });
                        }
                    });
            }
        });
};

exports.bindToDep = function(req, res) {
    if (!req.body.params || !req.body.params.users || !req.body.params.users.length || !req.body.params.department)
        return res.status(400).send('Empty request');
    var users = req.body.params.users,
        department = req.body.params.department,
        query = {};
    if (department === '-1')
        query.$unset = {
            department: 1
        };
    else
        query.$set = {
            department: department
        };
    User
        .update({
            _id: {
                $in: users
            }
        }, query, {
            multi: true
        })
        .exec(function(err) {
            if (err) {
                console.log(err);
                return res.status(500).send(err);
            } else
                User
                .find({
                    _id: {
                        $nin: users
                    },
                    department: department
                }, {
                    _id: 1,
                    name: 1
                }, function(err, nusers) {
                    if (err) {
                        console.log(err);
                        return res.status(500).send(err);
                    } else {
                        var sEvent = {
                            category: 0,
                            code: 'depmanager::bindToDep',
                            level: 'info',
                            targetPersons: _.map(nusers, '_id'),
                            title: 'New employee' + (users.length > 0 ? 's' : '') + ' in the department: ' + _.map(users, 'name').join(', '),
                            link: '/#!/users',
                            initPerson: req.user._id
                        };
                        var EventProcessor = require('meanio').events;
                        EventProcessor.emit('notification', sEvent);
                        return res.status(200).send();
                    }
                });
        });
};

exports.allUsersByDeps = function(req, res) {
    User
        .findOne({
            _id: req.user._id
        }, {
            roles: 1,
            department: 1
        }, function(err, user) {
            if (err) {
                console.log(err);
                return res.status(500).send(err);
            } else {
                if (user && user.roles.indexOf('admin') !== -1) {
                    User
                        .find()
                        .populate('department')
                        .sort({
                            department: 1,
                            name: 1,
                            username: 1
                        })
                        .lean()
                        .exec(
                            function(err, users) {
                                if (err) {
                                    console.log(err);
                                    return res.status(500).send(err);
                                } else {
                                    _.forEach(users, function(u) {
                                        if (u.department) {
                                            u.departmentTitle = u.department.title;
                                            u.departmentLevel = u.department.level;
                                        } else {
                                            u.departmentTitle = 'None';
                                            u.departmentLevel = 0;
                                        }
                                        if (u.roles && u.roles.length > 1)
                                            u.roles = u.roles[1].substring(0, 1).toUpperCase();
                                        else if (u.roles && u.roles.length === 1 && u.roles.indexOf('fired') !== -1)
                                            u.roles = 'F';
                                        else
                                            u.roles = 'N/v';
                                    });
                                    var result = _.chain(users)
                                        .groupBy(function(n) {
                                            return new Array(n.departmentLevel + 1).join('- ') + n.departmentTitle /*+ ' (level ' + n.departmentLevel + ')'*/ ;
                                        })
                                        .pairs()
                                        .map(function(currentItem) {
                                            return _.object(_.zip(['department', 'users'], currentItem));
                                        })
                                        .value();
                                    result = result.sort(function(a, b) {
                                        if (a.department && a.department === 'None' && b.department && b.department !== 'None')
                                            return -1;
                                        if (a.department && a.department !== 'None' && b.department && b.department === 'None')
                                            return 1;
                                        if (a.department && (a.department.split('- ').length - 1) < (b.department.split('- ').length - 1))
                                            return -1;
                                        if (a.department && (a.department.split('- ').length - 1) > (b.department.split('- ').length - 1))
                                            return 1;
                                        if (a.department && (a.department.split('- ').length - 1) === (b.department.split('- ').length - 1))
                                            return 0;
                                    });
                                    return res.jsonp(result);
                                }
                            });
                } else if (user.roles.indexOf('manager') !== -1 && user.department) {
                    NewDepartment
                        .find({
                            $or: [{
                                parents: user.department
                            }, {
                                _id: user.department
                            }]
                        }, {
                            _id: 1
                        }, function(err, deps) {
                            if (err) {
                                console.log(err);
                                return res.status(500).send(err);
                            } else {
                                User
                                    .find({
                                        department: {
                                            $in: _.map(deps, '_id')
                                        }
                                    })
                                    .populate('department')
                                    .sort({
                                        department: 1,
                                        name: 1,
                                        username: 1
                                    })
                                    .lean()
                                    .exec(
                                        function(err, users) {
                                            if (err) {
                                                console.log(err);
                                                return res.status(500).send(err);
                                            } else {
                                                _.forEach(users, function(u) {
                                                    if (u.department) {
                                                        u.departmentTitle = u.department.title;
                                                        u.departmentLevel = u.department.level;
                                                    } else {
                                                        u.departmentTitle = 'None';
                                                        u.departmentLevel = 0;
                                                    }
                                                    if (u.roles && u.roles.length > 1)
                                                        u.roles = u.roles[1].substring(0, 1).toUpperCase();
                                                    else if (u.roles && u.roles.length === 1 && u.roles.indexOf('fired') !== -1)
                                                        u.roles = 'F';
                                                    else
                                                        u.roles = 'N/v';
                                                });
                                                var result = _.chain(users)
                                                    .groupBy(function(n) {
                                                        return new Array(n.departmentLevel + 1).join('- ') + n.departmentTitle /*+ ' (level ' + n.departmentLevel + ')'*/ ;
                                                    })
                                                    .pairs()
                                                    .map(function(currentItem) {
                                                        return _.object(_.zip(['department', 'users'], currentItem));
                                                    })
                                                    .value();
                                                result = result.sort(function(a, b) {
                                                    if (a.department && a.department === 'None' && b.department && b.department !== 'None')
                                                        return -1;
                                                    if (a.department && a.department !== 'None' && b.department && b.department === 'None')
                                                        return 1;
                                                    if (a.department && (a.department.split('- ').length - 1) < (b.department.split('- ').length - 1))
                                                        return -1;
                                                    if (a.department && (a.department.split('- ').length - 1) > (b.department.split('- ').length - 1))
                                                        return 1;
                                                    if (a.department && (a.department.split('- ').length - 1) === (b.department.split('- ').length - 1))
                                                        return 0;
                                                });
                                                return res.jsonp(result);
                                            }
                                        });
                            }
                        });
                } else {
                    return res.status(500).send('Error while finding current user department');
                }
            }
        });
};
