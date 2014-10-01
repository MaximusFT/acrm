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
		function (err, department) {
		if (err) {
			res.render('error', {
				status : 500
			});
		} else {
			res.jsonp(department);
		}
	});
};

/*exports.passesByGroup = function (req, res) {
	var groupId = req.query.groupId;
	Pass.find({
		group : groupId
	},
		function (err, pass) {
		if (err) {
			res.render('error', {
				status : 500
			});
		} else {
			//console.log(pass);
			res.jsonp(pass);
		}
	});
};*/

/*exports.delPass = function (req, res) {
	//console.log(req);
	var passId = req.query.passId;
	if (req.body._id) {
		delete req.body._id;
	}
	Pass.findById(passId, function (err, pass) {
		//if (err) { return handleError(res, err); }
		if (!pass) {
			return res.send(404);
		}
		_.extend(pass, req.body);
		pass.remove(function (err) {
			if (err) {
				res.render('error', {
					status : 500
				});
			} else {
				res.jsonp(pass);
			}
		});
	});
};*/

/*exports.getPass = function (req, res) {
	var passId = req.query.passId;
	console.log(passId);
	Pass
	.findOne({
		_id : passId
	})
	.exec(function (err, pass) {
		//req.profile = pass;
		res.jsonp(pass);
	});
};*/