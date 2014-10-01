'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
//Pass = mongoose.model('Pass'),
//User = mongoose.model('User'),
Department = mongoose.model('Department'),
_ = require('lodash');

/**
 * Create department
 */
exports.create = function (req, res, next) {
	var department = new Department(req.body);

	var errors = req.validationErrors();
	console.log(errors);
	if (errors) {
		return res.status(400).send(errors);
	}

	department.save(function (err) {
		console.log(err);
		if (err) {
			switch (err.code) {
			default:
				res.status(400).send('Please fill all the required fields');
			}

			return res.status(400);
		}
		res.jsonp(department);
	});
};

/**
 * Find department by id
 */
exports.department = function (req, res, next, id) {
	Department
	.findOne({
		_id : id
	})
	.exec(function (err, department) {
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
exports.update = function (req, res) {
	var department = req.profile;
	//console.log(department);
	department = _.extend(department, req.body);
	department.save(function (err) {
		res.jsonp(department);
	});
};
/*exports.update = function (req, res) {
	if (req.body._id) {
		delete req.body._id;
	}
	Department.findById(req.params.passId, function (err, pass) {
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
exports.destroy = function (req, res) {
	if (req.body._id) {
		delete req.body._id;
	}
	Department.findById(req.params.departmentId, function (err, department) {
		//if (err) { return handleError(res, err); }
		if (!department) {
			return res.send(404);
		}
		_.extend(department, req.body);
		department.remove(function (err) {
			if (err) {
				res.render('error', {
					status : 500
				});
			} else {
				res.jsonp(department);
			}
		});
	});
};

/**
 * List of Departments
 */
exports.all = function (req, res) {
	Department.find().sort('name').exec(
		function (err, departments) {
		if (err) {
			res.render('error', {
				status : 500
			});
		} else {
			res.jsonp(departments);
		}
	});
};

exports.allNames = function (req, res) {
	Department.find({}, {_id: 0, name: 1}).sort('name').exec(
		function (err, departments) {
		if (err) {
			res.render('error', {
				status : 500
			});
		} else {		
			res.jsonp(_.map(departments, 'name'));
		}
	});
};

exports.groups = function (req, res) {
	Department.find({}).sort({'name':1, 'parent':1}).exec(
		function (err, department) {
		if (err) {
			res.render('error', {
				status : 500
			});
		} else {
			/*var result = _.chain(department)
				.groupBy('group')
				.pairs()
				.map(function (currentItem) {
					return _.object(_.zip(['group', 'passes'], currentItem));
				})
				.value();
			res.jsonp(result);*/
			res.jsonp(department);
		}
	});
};

exports.delDepartment = function (req, res) {
	//console.log(req);
	var departmentId = req.query.departmentId;
	if (req.body._id) {
		delete req.body._id;
	}
	Department.findById(departmentId, function (err, department) {
		//if (err) { return handleError(res, err); }
		if (!department) {
			return res.send(404);
		}
		_.extend(department, req.body);
		department.remove(function (err) {
			if (err) {
				res.render('error', {
					status : 500
				});
			} else {
				res.jsonp(department);
			}
		});
	});
};