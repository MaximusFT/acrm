'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
User = mongoose.model('User'),
_ = require('lodash');

/**
 * Create user
 */
exports.create = function (req, res, next) {
	var user = new User(req.body);
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
	user.save(function (err) {
		if (err) {
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
exports.user = function (req, res, next, id) {
	User
	.findOne({
		_id : id
	})
	.exec(function (err, user) {
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
exports.update = function (req, res) {
	var user = req.profile;
	user = _.extend(user, req.body);

	user.save(function (err) {
		res.jsonp(user);
	});
};

/**
 * Delete an user
 */
exports.destroy = function (req, res) {
	var user = req.profile;

	user.remove(function (err) {
		if (err) {
			res.render('error', {
				status : 500
			});
		} else {
			res.jsonp(user);
		}
	});
};

/**
 * List of Users
 */
exports.all = function (req, res) {
	User.find().sort('-created').populate('user', 'name username').exec(function (err, users) {
		if (err) {
			res.render('error', {
				status : 500
			});
		} else {
			res.jsonp(users);
		}
	});
};

exports.groups = function (req, res) {
	User.findOne({
		_id : req.user._id
	}, {
		'_id' : 0,
		'department' : 1,
		'roles' : 1
	}).exec(
		function (err, user) {
		if (err) {
			res.render('error', {
				status : 500
			});
		} else {
			var roles = user.roles;
			if (roles.indexOf('admin') !== -1) {
				User.find({}).sort({
					'department' : 1,
					'name' : 1,
					'username' : 1
				}).exec(
					function (err, user) {
					if (err) {
						res.render('error', {
							status : 500
						});
					} else {
						var result = _.chain(user)
							.groupBy('department')
							.pairs()
							.map(function (currentItem) {
								return _.object(_.zip(['department', 'users'], currentItem));
							})
							.value();
						res.jsonp(result);
					}
				});
			}
			if (roles.indexOf('manager') !== -1 || roles.indexOf('employeer') !== -1) {
				User.find({
					department : user.department
				}).sort({
					'department' : 1,
					'name' : 1,
					'username' : 1
				}).exec(
					function (err, user) {
					if (err) {
						res.render('error', {
							status : 500
						});
					} else {
						var result = _.chain(user)
							.groupBy('department')
							.pairs()
							.map(function (currentItem) {
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

exports.getUser = function (req, res) {
	/*var id = req.query.userId;
	User.findOne({ 'username' : id },
	function (err, user) {
	if(err) {
	res.render('error', {
	status : 500
	});
	} else {
	if(!user)
	res.render('error', {
	status : 500
	});
	else
	res.jsonp(user);
	}
	});*/
	User.findOne({
		_id : req.user._id
	}, {
		'roles' : 1,
		'department' : 1
	}, function (err, curUser) {
		if (err) {
			res.render('error', {
				status : 500
			});
		} else {
			if (curUser.roles.indexOf('manager') !== -1 || curUser.roles.indexOf('employeer') !== -1) {
				User.findOne({
					'username' : req.query.userId
				},
					function (err, user) {				
					if (err) {
						res.render('error', {
							status : 500
						});
					} else {
						if(user.department[0] !== curUser.department[0]) {
							res.status(500).send('Permission denied');
							return;
						} else {
							res.jsonp(user);
						}
					}
				});
			}
		}
	});
};

exports.department = function (req, res) {
	var department = req.query.department;
	User.find({
		'department' : department
	},
		function (err, user) {
		if (err) {
			res.render('error', {
				status : 500
			});
		} else {
			res.jsonp(user);
		}
	});
};
