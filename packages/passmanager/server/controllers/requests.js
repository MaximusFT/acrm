'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
Request = mongoose.model('Request'),
//User = mongoose.model('User'),
Pass = mongoose.model('Pass'),
Department = mongoose.model('Department'),
_ = require('lodash');

/**
 * Create request
 */
exports.create = function (req, res, next) {
	req.body.who = req.user._id;
	var request = new Request(req.body);

	var errors = req.validationErrors();
	console.log(errors);
	if (errors) {
		return res.status(400).send(errors);
	}

	request.save(function (err) {
		console.log(err);
		if (err) {
			switch (err.code) {
			default:
				res.status(400).send('Please fill all the required fields');
			}

			return res.status(400);
		}
		res.jsonp(request);
	});
};

/**
 * Find department by id
 */
exports.request = function (req, res, next, id) {
	Request
	.findOne({
		_id : id
	})
	.exec(function (err, request) {
		if (err)
			return next(err);
		if (!request)
			return next(new Error('Failed to load Request ' + id));
		req.profile = request;
		next();
	});
};
/**
 * Update a request
 */
exports.update = function (req, res) {
	var request = req.profile;
	//console.log(request);
	request = _.extend(request, req.body);
	request.save(function (err) {
		res.jsonp(request);
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
 * Delete an request
 */
exports.destroy = function (req, res) {
	if (req.body._id) {
		delete req.body._id;
	}
	Request.findById(req.params.requestId, function (err, request) {
		//if (err) { return handleError(res, err); }
		if (!request) {
			return res.send(404);
		}
		_.extend(request, req.body);
		request.remove(function (err) {
			if (err) {
				res.render('error', {
					status : 500
				});
			} else {
				res.jsonp(request);
			}
		});
	});
};

/**
 * List of Requests
 */
exports.all = function (req, res) {
	Request
	.find()
	.populate('what')
	.populate('who')
	.lean()
	.exec(function (err, requests) {
		if (err) {
			res.render('error', {
				status : 500
			});
		} else {
			if (!requests || requests.length === 0)
				return res.jsonp(requests);
			else {
				_(requests).forEach(function (r, ind) {
					Department
					.findById(r.who.department, function (err, dep) {
						if (err) {
							res.render('error', {
								status : 500
							});
						} else {
							r.who.department = dep.name;
							if (ind === requests.length - 1) {
								//console.log(requests);
								return res.jsonp(requests);
							}
						}
					});
				});
			}
		}
	});
};

exports.confirmRequest = function (req, res) {
	var reqId = req.body.reqId;
	var type = req.body.type;
	if ((!reqId || !type) && type !== 0) {
		return res.render('error', {
			status : 500
		});
	}
	switch (type) {
	/*case 0:
		Request
		.findOne({
			_id : reqId
		})
		.populate('what')
		.exec(function (err, request) {
			if (err) {
				res.render('error', {
					status : 500
				});
			} else {
				Pass
				.update({
					_id : request.what._id
				}, {
					$push : {
						'accessedFor' : request.who
					}
				})
				.exec(function (err) {
					if (err) {
						return res.json(500, {
							error : err
						});
					}
					exports.rejectRequest(req, res);
				});
			}
		});
		break;*/
	case 1:
		Request
		.findOne({
			_id : reqId
		})
		.populate('what')
		.exec(function (err, request) {
			if (err) {
				res.render('error', {
					status : 500
				});
			} else {
				var pass = new Pass(request.info);
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
					exports.rejectRequest(req, res);
				});
			}
		});
		break;
	case 2:
		Request
		.findOne({
			_id : reqId
		})
		.populate('what')
		.exec(function (err, request) {
			if (err) {
				res.render('error', {
					status : 500
				});
			} else {
				console.log(request);
				/*Pass
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
				});*/
			}
		});
		break;
	}
};

exports.rejectRequest = function (req, res) {
	var reqId = req.body.reqId;
	Request.findById(reqId, function (err, request) {
		if (err) {
			res.render('error', {
				status : 500
			});
		}
		if (!request) {
			return res.send(404);
		}
		_.extend(request, req.body);
		request.remove(function (err) {
			if (err) {
				return res.render('error', {
					status : 500
				});
			} else {
				return res.jsonp(request);
			}
		});
	});
};

exports.getReqs = function (req, res) {
	if (!req.query.type)
		return res.render('Empty query', {
			status : 500
		});

	Request
	.find({
		type : req.query.type
	})
	.sort({
		'when' : -1
	})
	.populate('what')
	.populate('who')
	.exec(function (err, reqs) {
		if (err) {
			return res.render(err, {
				status : 500
			});
		} else {
			return res.jsonp(reqs);
		}
	});
};