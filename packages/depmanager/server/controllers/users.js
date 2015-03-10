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
        return res.status(500).send('Empty request');
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
        return res.status(500).send('Empty request');
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
                return res.status(200).send();
        });
};
