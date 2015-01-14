'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Department = mongoose.model('Department'),
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
exports.department = function(req, res, next, id) {
    Department
        .findOne({
            _id: id
        })
        .exec(function(err, department) {
            if (err)
                return next(err);
            if (!department)
                return next(new Error('Failed to load Department ' + id));
            req.profile = department;
            next();
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
/*exports.update = function (req, res) {
if (req.body._id) {
delete req.body._id;
}
Pass.findById(req.params.passId, function (err, pass) {
//if (err) { return handleError(res, err); }
if (!pass) {
return res.send(404);
}
_.extend(pass, req.body);
pass.save(function (err) {
//if (err) { return handleError(res, err); }
return res.json(200, pass);
});
});
};*/

/**
 * Delete an department
 */
exports.destroy = function(req, res) {
    if (req.body._id) {
        delete req.body._id;
    }
    Department.findById(req.params.departmentId, function(err, department) {
        //if (err) { return handleError(res, err); }
        if (!department) {
            return res.send(404);
        }
        _.extend(department, req.body);
        department.remove(function(err) {
            if (err) {
                res.render('error', {
                    status: 500
                });
            } else {
                res.jsonp(department);
            }
        });
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
