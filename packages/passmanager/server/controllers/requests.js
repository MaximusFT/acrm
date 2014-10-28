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
			_(requests).forEach(function(r, ind) {
				Department
				.findById(r.who.department, function(err, dep) {
					if (err) {
						res.render('error', {
							status : 500
						});
					} else {
						r.who.department = dep.name;
						if(ind === requests.length-1)
							return res.jsonp(requests);
					}
				});
			});		
		}
	});
};

exports.provideAccess = function(req, res) {
	var reqId = req.query.reqId;
	Request
	.findOne({_id : reqId})
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
				$push : {'accessedFor' : request.who}
			})
			.exec(function (err) {
				if(err) {
					return res.json(500, {
						error : err
					});
				}
				exports.rejectRequest(req, res);
			});
		}
	});
};

exports.rejectRequest = function(req, res) {
	var reqId = req.query.reqId;
	Request.findById(reqId, function (err, request) {
		if(err) {
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
				res.render('error', {
					status : 500
				});
			} else {
				res.jsonp(request);
			}
		});
	});
};