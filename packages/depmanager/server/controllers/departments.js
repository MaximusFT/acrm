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
    if (!req.query || !req.query.departmentId)
        return res.status(500).send('Empty query');
    NewDepartment
        .findOne({
            _id: req.query.departmentId
        })
        .populate('head')
        .lean()
        .exec(function(err, department) {
            if (err) {
                console.log(err);
                return res.status(500).send(err);
            } else {
                if (department && department.head && department.head.name)
                    department.head = department.head.name;
                return res.jsonp(department);
            }
        });
};

/**
 * Update a department
 */
exports.update = function(req, res) {
    var department = req.profile;
    //console.log(department);
    department = _.extend(department, req.body);
    department.save(function(err) {
        res.jsonp(department);
    });
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
    NewDepartment
        .find({}, {
            '_id': 1,
            'title': 1
        })
        .lean()
        .exec(function(err, deps) {
            if (err) {
                return res.json(500, {
                    error: err
                });
            } else {
                deps.splice(0, 0, {
                    _id: '-1',
                    title: 'None'
                });
                return res.jsonp(deps);
            }
        });
};

exports.getDepartment = function(req, res) {
    if (req.user.roles.indexOf('employee') !== -1) {
        res.status(500).send('Permission denied');
    }
    var departmentId = req.query.departmentId;
    if (departmentId === '') {
        res.status(400).send('Invalid URI');
        return;
    }
    console.log(departmentId);
    Department
        .findOne({
            _id: departmentId
        })
        .exec(function(err, department) {
            res.jsonp(department);
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
            for (var i = 0; result === null && i < element.items.length; i += 1) {
                result = searchTree([element.items[i]], matchingId, cb);
            }
            ret = result;
            cb(ret);
        }
    });
    //return ret;
}

function createTree(departments) {
    departments = _.sortBy(departments, 'level');
    var tree = [];
    _.forEach(new Array(departments[departments.length - 1].level + 1), function(t, index) {
        var result = _.filter(departments, function(dep) {
            return dep.level === index;
        });
        if (index === 0) {
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

exports.newDepartmentsTree = function(req, res) {
    if (req.user.roles.indexOf('admin') !== -1) {
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
                            return res.jsonp(createTree(departments));
                        else
                            return res.jsonp(departments);
                    }
                });
    }
    if (req.user.roles.indexOf('manager') !== -1) {
        NewDepartment.find().sort('name').exec(
            function(err, departments) {
                if (err) {
                    res.render('error', {
                        status: 500
                    });
                } else {
                    res.jsonp(createTree(departments));
                }
            });
    }
    if (req.user.roles.indexOf('employee') !== -1) {
        res.status(500).send('Access denied');
    }
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
