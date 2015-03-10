'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    Department = mongoose.model('Department'),
    NewDepartment = mongoose.model('NewDepartment'),
    _ = require('lodash');

/**
 * Create department
 */
exports.create = function(req, res, next) {
    var department = new Department(req.body);
    var errors = req.validationErrors();
    console.log(errors);
    if (errors) {
        return res.status(400).send(errors);
    }
    department.save(function(err) {
        console.log(err);
        if (err) {
            switch (err.code) {
                default: res.status(400).send('Please fill all the required fields');
            }
            return res.status(400);
        }
        res.jsonp(department);
    });
};

/**
 * Send department
 */
exports.me = function(req, res) {
    res.json(req.department || null);
};

/**
 * Find pass by id
 */
exports.department = function(req, res) {
    if (!req.params || !req.params.departmentId)
        return res.status(500).send('Empty query');
    NewDepartment
        .findOne({
            _id: req.params.departmentId
        })
        .populate('head', '-roles -phone -hashed_password -salt -provider')
        .lean()
        .exec(function(err, department) {
            if (err) {
                console.log(err);
                return res.status(500).send(err);
            } else {
                /*if (department && department.head && department.head.name)
                    department.head = department.head.name;*/
                return res.jsonp(department);
            }
        });
};

/**
 * Update a department
 */
exports.update = function(req, res) {
    console.log('upd dep', req.params, req.body);
};

/**
 * Delete an department
 */
exports.destroy = function(req, res) {
    if (!req.params || !req.params.departmentId)
        return res.status(500).send('Empty query');
    NewDepartment
        .remove({
            _id: req.params.departmentId
        }, function(err) {
            if (err) {
                console.log(err);
                return res.status(500).send(err);
            } else {
                return res.status(200).send('ok');
            }
        });
};

/**
 * List of departments
 */
exports.all = function(req, res) {
    if (req.user.roles.indexOf('admin') !== -1) {
        Department
            .find()
            .sort('name')
            .exec(
                function(err, departments) {
                    if (err) {
                        res.render('error', {
                            status: 500
                        });
                    } else {
                        return res.jsonp(_.map(departments, function(department, index) {
                            var temp = {};
                            //temp.id = index + 1;
                            //temp._id = department._id;
                            temp.label = department.name;
                            temp._id = department._id;
                            //temp.nodes = [];
                            return temp;
                        }));
                        //return res.jsonp(departments);
                    }
                });
    }
    if (req.user.roles.indexOf('manager') !== -1) {
        Department.find().sort('name').exec(
            function(err, departments) {
                if (err) {
                    res.render('error', {
                        status: 500
                    });
                } else {
                    res.jsonp(departments);
                }
            });
    }
    if (req.user.roles.indexOf('employee') !== -1) {
        res.status(500).send('Permission denied');
    }
};

exports.getDeps = function(req, res) {
    Department
        .find({}, {
            '_id': 1,
            'name': 1
        })
        .lean()
        .exec(function(err, deps) {
            if (err) {
                return res.json(500, {
                    error: err
                });
            } else {
                return res.jsonp(deps);
            }
        });
};

function saveNewDepartment(res, department) {
    console.log('trying save', department);
    var newDepartment = new NewDepartment(department);
    newDepartment.save(function(err) {
        if (err) {
            console.log(err);
            return res.status(500).send(err);
        } else {
            //department.id = department._id;
            return res.status(200).send(newDepartment);
        }
    });
}

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
                            items: []
                        });
                });
            });
        }
    });
    return tree;
}

function searchList(list, matchingId, cb) {
    var ret = null;
    _.forEach(list, function(element, index) {
        if (JSON.stringify(element._id) === JSON.stringify(matchingId)) {
            //console.log('match!!', element);
            ret = index + 1;
            return cb(ret);
        }
    });
    //return cb(ret);
}

function createList(departments) {
    departments = _.sortBy(departments, 'level');
    var list = [];
    _.forEach(new Array(departments[departments.length - 1].level + 1), function(t, index) {
        var result = _.filter(departments, function(dep) {
            return dep.level === index;
        });
        if (index === 0) {
            _.forEach(result, function(department) {
                list.push({
                    _id: department._id,
                    title: department.title
                });
            });
        } else {
            _.forEach(result, function(department) {
                searchList(list, department.parents[department.parents.length - 1], function(spliceIndex) {
                    //console.log('found', spliceIndex);
                    if (spliceIndex)
                        list.splice(spliceIndex, 0, {
                            _id: department._id,
                            title: new Array(department.level).join('- ') + department.title
                        });
                });
            });
        }
    });
    return list;
}

exports.getNewDeps = function(req, res) {
    NewDepartment
        .find()
        .lean()
        .exec(function(err, deps) {
            if (err) {
                return res.json(500, {
                    error: err
                });
            } else {
                if (deps && deps.length > 0) {
                    var result = createList(deps);
                    result.splice(0, 0, {
                        _id: '-1',
                        title: 'None'
                    });
                    return res.jsonp(result);
                } else {
                    deps.splice(0, 0, {
                        _id: '-1',
                        title: 'None'
                    });
                    return res.jsonp(deps);
                }
            }
        });
};

exports.departmentsTree = function(req, res) {
    if (!req.user)
        return res.status(401).send('Not authenticated');
    User
        .findOne({
            _id: req.user._id
        }, function(err, user) {
            if (err) {
                console.log(err);
                return res.status(500).send(err);
            } else {
                if (user) {
                    if (user.roles.indexOf('admin') !== -1) {
                        NewDepartment
                            .find()
                            .sort('title')
                            .exec(
                                function(err, departments) {
                                    if (err) {
                                        res.render('error', {
                                            status: 500
                                        });
                                    } else {
                                        if (departments && departments.length > 0)
                                            return res.jsonp({
                                                departments: createTree(departments),
                                                drag: true
                                            });
                                        else
                                            return res.jsonp(departments);
                                    }
                                });
                    } else if (user.roles.indexOf('manager') !== -1 && user.department) {
                        NewDepartment
                            .find({
                                parents: mongoose.Types.ObjectId(user.department)
                            })
                            .sort('title')
                            .exec(
                                function(err, departments) {
                                    if (err) {
                                        res.render('error', {
                                            status: 500
                                        });
                                    } else {
                                        if (departments && departments.length > 0) {
                                            return res.jsonp({
                                                departments: createTree(departments)
                                            });
                                        } else {
                                            return res.jsonp({
                                                departments: []
                                            });
                                        }
                                    }
                                });
                    } else
                        res.status(403).send('Access denied');
                } else
                    return res.status(500).send('Invalid user');
            }
        });
};

exports.addNewDepartmentBranch = function(req, res) {
    if (!req.body || !req.body.params || !req.body.params.department)
        return res.status(500).send('Empty query');
    User.findOne({
        _id: req.user._id
    }, function(err, user) {
        if (err) {
            console.log(err);
            return res.status(500).send(err);
        } else {
            if (user && user.roles && user.roles.indexOf('admin') !== -1) {
                var department = req.body.params.department;
                //department.level = getLevelByParent(department.parent);
                if (department.parent !== '-1') {
                    NewDepartment
                        .findOne({
                            _id: department.parent
                        }, function(err, parent) {
                            if (err) {
                                console.log(err);
                                return res.status(500).send(err);
                            } else {
                                department.level = parent.level + 1;
                                department.parents = parent.parents;
                                department.parents.push(parent._id);
                                saveNewDepartment(res, department);
                            }
                        });
                } else {
                    department.level = 0;
                    saveNewDepartment(res, department);
                }
            } else {
                return res.status(403).send('Access denied');
            }
        }
    });
};

exports.changeParent = function(req, res) {
    if (!req.body || !req.body.params || !req.body.params.source)
        return res.status(500).send('Empty query');
    if (req.body.params.dest) {
        NewDepartment
            .findOne({
                _id: req.body.params.dest
            }, {
                'parents': 1,
                'level': 1
            }, function(err, parent) {
                if (err) {
                    console.log(err);
                    return res.status(500).send(err);
                } else {
                    //console.log('parent', parent);
                    NewDepartment
                        .update({
                            _id: req.body.params.source
                        }, {
                            $set: {
                                parents: parent.parents.concat(parent._id),
                                level: parent.level + 1
                            }
                        }, function(err, updated) {
                            if (err) {
                                console.log(err);
                                return res.status(500).send(err);
                            } else {
                                //console.log('updated', updated);
                                return res.status(200).send();
                            }
                        });
                }
            });
    } else {
        NewDepartment
            .update({
                _id: req.body.params.source
            }, {
                $set: {
                    parents: [],
                    level: 0
                }
            }, function(err, updated) {
                if (err) {
                    console.log(err);
                    return res.status(500).send(err);
                } else {
                    //console.log('updated', updated);
                    return res.status(200).send();
                }
            });
    }
};
