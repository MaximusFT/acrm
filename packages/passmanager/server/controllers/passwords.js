'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
Pass = mongoose.model('Pass'),
User = mongoose.model('User'),
//Department = mongoose.model('Department'),
_ = require('lodash');

/**
 * Create pass
 */
exports.create = function (req, res, next) {
	var pass = new Pass(req.body);
	var errors = req.validationErrors();
	console.log(errors);
	if (errors) {
		return res.status(400).send(errors);
	}
	pass.save(function (err) {
		console.log(err);
		if (err) {
			switch (err.code) {
			default:
				res.status(400).send('Please fill all the required fields');
			}

			return res.status(400);
		}
		return res.jsonp(pass);
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
exports.update = function (req, res) {
	var pair = req.body;
	var passId = req.params.passId;
	if (!pair || !passId) {
		//console.log('Empty query');
		return res.render('Empty query', {
			status : 500
		});
	} else {
		var up = {};
		up[pair.key] = pair.val;
		Pass
		.update({
			_id : passId
		}, {
			$set : up
		})
		.exec(function (err) {
			if (err) {
				return res.json(500, {
					error : err
				});
			} else {
				return res.jsonp('ok');
			}
		});
	}
};

/**
 * Delete an pass
 */
exports.destroy = function (req, res) {
	if (req.body._id) {
		delete req.body._id;
	}
	Pass.findById(req.params.passId, function (err, pass) {
		if (err) {
			console.log(err);
			res.render('error', {
				status : 500
			});
		}
		if (!pass) {
			return res.send(404);
		}
		_.extend(pass, req.body);
		pass.remove(function (err) {
			if (err) {
				return res.render('error', {
					status : 500
				});
			} else {
				return res.jsonp(pass);
			}
		});
	});
};

/**
 * List of Users
 */
exports.all = function (req, res) {
	Pass.find().sort('group').exec(
		function (err, pass) {
		if (err) {
			return res.render('error', {
				status : 500
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
		return _(collection).groupBy(keys[0]).mapValues(function (values) {
			return nest(values, keys.slice(1));
		}).value();
	}
}

function groupBy(data) {
	return _.chain(nest(data, ['group', 'implement']))
	.pairs()
	.map(function (currentItem) {
		var implement = _.chain(currentItem[1])
			.pairs()
			.map(function (curIt) {
				return _.object(_.zip(['implement', 'passes'], curIt));
			})
			.value();
		return _.object(_.zip(['group', 'implement'], [currentItem[0], implement]));
	})
	.value();
}

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
				Pass.find({}, {
					'accessedFor' : 0
				}).sort({
					'group' : 1,
					'implement' : 1,
					'resourceName' : 1,
					'email' : 1
				}).exec(
					function (err, pass) {
					if (err) {
						return res.render('error', {
							status : 500
						});
					} else {
						var result = groupBy(pass);
						return res.jsonp(result);
					}
				});
			}
			if (roles.indexOf('manager') !== -1) {
				Pass.find({}, {
					'group' : 1,
					'implement' : 1,
					'resourceName' : 1,
					'resourceUrl' : 1
				}).sort({
					'group' : 1,
					'implement' : 1,
					'resourceName' : 1,
					'email' : 1
				}).exec(
					function (err, passes) {
					if (err) {
						return res.render('error', {
							status : 500
						});
					} else {
						var result = groupBy(passes);
						return res.jsonp(result);
					}
				});
			}
			if (roles.indexOf('employee') !== -1) {
				Pass.find({
					accessedFor : {
						$in : [req.user._id]
					}
				}, {
					'accessedFor' : 0
				}).sort({
					'group' : 1,
					'implement' : 1,
					'resourceName' : 1,
					'email' : 1
				}).exec(
					function (err, pass) {
					if (err) {
						return res.render('error', {
							status : 500
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

exports.acsgroups = function (req, res) {
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
			if (roles.indexOf('manager') !== -1) {
				User.find({
					department : user.department
				}, {
					'_id' : 1
				}).exec(
					function (err, users) {
					if (err) {
						res.render('error', {
							status : 500
						});
						return false;
					} else {
						var uids = _.map(users, '_id');
						Pass.find({
							accessedFor : {
								$in : uids
							}
						}, {
							'accessedFor' : 0
						})
						.exec(
							function (err, passes) {
							if (err) {
								return res.render('error', {
									status : 500
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

exports.passesByGroup = function (req, res) {
	var groupId = req.query.groupId;
	Pass.find({
		group : groupId
	}, {
		'accessedFor' : 0
	})
	.exec(function (err, pass) {
		if (err) {
			return res.render('error', {
				status : 500
			});
		} else {
			//console.log(pass);
			return res.jsonp(pass);
		}
	});
};

exports.delPass = function (req, res) {
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
				return res.render('error', {
					status : 500
				});
			} else {
				return res.jsonp(pass);
			}
		});
	});
};

exports.getPass = function (req, res) {
	var passId = req.query.passId;
	if (passId === '') {
		res.status(400).send('Invalid URI');
		return;
	}
	User.findOne({
		_id : req.user._id
	}, {
		'_id' : 1,
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
				Pass
				.findOne({
					_id : passId
				})
				.exec(function (err, pass) {
					if (err) {
						return res.json(500, {
							error : err
						});
					} else {
						return res.jsonp([pass]);
					}
				});
			}
			if (roles.indexOf('manager') !== -1) {
				User
				.find({
					department : user.department
				})
				.exec(function (err, users) {
					if (err) {
						return res.json(500, {
							error : err
						});
					} else {
						var uids = _.map(users, '_id');
						Pass
						.findOne({
							$and : [{
									_id : passId
								}, {
									accessedFor : {
										$in : uids
									}
								}
							]
						})
						.exec(function (err, pass) {
							if (err) {
								return res.json(500, {
									error : err
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
					$and : [{
							_id : passId
						}, {
							accessedFor : user._id
						}
					]
				})
				.exec(function (err, pass) {
					if (err) {
						console.log(err);
						return res.json(500, {
							error : err
						});
					} else {
						return res.jsonp(!pass ? [] : [pass]);
					}
				});
			}
		}
	});
};

exports.provideAccess = function (req, res) {
	var users = req.body.users;
	var deps = req.body.deps;
	var passes = req.body.passes;
	if (users) {
		Pass
		.update({
			_id : {
				$in : passes
			}
		}, {
			$addToSet : {
				'accessedFor' : {
					$each : users
				}
			}
		}, {
			multi : true
		})
		.exec(function (err) {
			if (err) {
				return res.json(500, {
					error : err
				});
			} else {
				return res.jsonp('ok');
			}
		});
	}
	if (deps) {
		deps = _.map(deps, '_id');
		User
		.find({
			department : {
				$in : deps
			}
		}, {
			_id : 1
		})
		.exec(function (err, users) {
			if (err) {
				console.log(err);
				res.render('error', {
					status : 500
				});
			}
			var uids = _.map(users, '_id');
			Pass
			.update({
				_id : {
					$in : passes
				}
			}, {
				$addToSet : {
					'accessedFor' : {
						$each : uids
					}
				}
			}, {
				multi : true
			})
			.exec(function (err) {
				if (err) {
					console.log(err);
					return res.json(500, {
						error : err
					});
				} else {
					return res.jsonp('ok');
				}
			});
		});
	}
};

exports.revokeAccess = function (req, res) {
	var users = req.body.users;
	var passes = req.body.passes;
	Pass
	.update({
		_id : {
			$in : passes
		}
	}, {
		$pullAll : {
			'accessedFor' : users
		}
	}, {
		multi : true
	})
	.exec(function (err) {
		if (err) {
			return res.json(500, {
				error : err
			});
		} else {
			return res.jsonp('ok');
		}
	});
};
