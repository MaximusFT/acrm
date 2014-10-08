'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
Request = mongoose.model('Request'),
User = mongoose.model('User'),
Pass = mongoose.model('Pass'),
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
	var ureses = [];
	Request.find().sort('who').exec(
		function (err, requests) {
		if (err) {
			res.render('error', {
				status : 500
			});
		} else {
			//var ureses = [];
			_(requests).forEach(function (request, index, array) {
				var ures = {};
				User.findOne({
					_id : request.who
				}, {
					'_id' : 0,
					'username' : 1
				})
				.exec(function (err, user) {
					if (err) {
						res.render('error', {
							status : 500
						});
					} else {
						ures.who = user.username;
						Pass.findOne({
							_id : request.what
						}, {
							'resourceName' : 1,
							'resourceUrl' : 1
						}).exec(function (err, pass) {
							if (err) {
								res.render('error', {
									status : 500
								});
							} else {
								ures.what = {};
								ures.what = pass;
								ures.when = request.when;
								ures.comment = request.comment;
								ureses.splice(ureses.length === 0 ? 1 : ureses.length, 0, ures);
								if (index === array.length - 1) {
									res.jsonp(_.sortBy(ureses, 'when').reverse());
								}
							}
						});					
					}
				});
			});
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
