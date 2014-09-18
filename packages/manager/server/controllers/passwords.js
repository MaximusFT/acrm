'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
Pass = mongoose.model('Pass'),
_ = require('lodash');

/**
 * Create pass
 */
exports.create = function (req, res, next) {
	var pass = new Pass(req.body);

	//pass.provider = 'local';

	// because we set our pass.provider to local our models/pass.js validation will always be true
	/*req.assert('email', 'You must enter a valid email address').isEmail();
	req.assert('password', 'Password must be between 8-20 characters long').len(8, 20);
	req.assert('username', 'Username cannot be more than 20 characters').len(1, 20);
	req.assert('confirmPassword', 'Passwords do not match').equals(req.body.password);*/

	var errors = req.validationErrors();
	console.log(errors);
	if (errors) {
		return res.status(400).send(errors);
	}

	// Hard coded for now. Will address this with the pass permissions system in v0.3.5
	//pass.roles = ['authenticated'];
	//pass.roles = req.body.roles;
	pass.save(function (err) {
		console.log(err);
		if (err) {
			switch (err.code) {
			default:
				res.status(400).send('Please fill all the required fields');
			}

			return res.status(400);
		}
		res.jsonp(pass);
	});
};

/**
 * Find pass by id
 */
exports.pass = function (req, res, next, id) {
	Pass
	.findOne({
		_id : id
	})
	.exec(function (err, pass) {
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
/*exports.update = function(req, res) {
var pass = req.profile;
pass = _.extend(pass, req.body);
console.log(pass);
pass.save(function(err) {
res.jsonp(pass);
});
};*/
exports.update = function (req, res) {
	if (req.body._id) {
		delete req.body._id;
	}
	Pass.findById(req.params.passId, function (err, pass) {
		//if (err) { return handleError(res, err); }
		if(!pass) { return res.send(404); }
		_.extend(pass, req.body);
		pass.save(function (err) {
			//if (err) { return handleError(res, err); }
			return res.json(200, pass);
		});
	});
};

/**
 * Delete an pass
 */
exports.destroy = function (req, res) {
	if (req.body._id) {
		delete req.body._id;
	}
	Pass.findById(req.params.passId, function (err, pass) {
		//if (err) { return handleError(res, err); }
		if(!pass) { return res.send(404); }
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
};

/**
 * List of Users
 */
exports.all = function (req, res) {
	Pass.find().sort('-created').populate('pass', 'name username').exec(function (err, passwords) {
		if (err) {
			res.render('error', {
				status : 500
			});
		} else {
			res.jsonp(passwords);
		}
	});
};
/*
exports.pass = function(req, res) {
	var name = 'Exiliot';
	Pass.findOne(
		{ '_id' : '540f0dfeae2f577c1b10b926' },
		function (err, pass) {
			console.log(err);
			if(err) {
				res.render('error', {
					status : 500
				});
			} else {
				res.jsonp(pass);
			}
	});
*/
/*
	Pass.find().sort('-created').populate('pass', 'name username').exec(function (err, passwords) {
		if (err) {
			res.render('error', {
				status : 500
			});
		} else {
			res.jsonp(passwords);
		}
	});*/
//};
