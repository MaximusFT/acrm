'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
PrPass = mongoose.model('PrPass'),
User = mongoose.model('User'),
_ = require('lodash');

/**
 * Create pass
 */
exports.create = function (req, res, next) {
	var pass = new PrPass(req.body);
	var errors = req.validationErrors();
	if (errors) {
		return res.status(400).send(errors);
	}
	pass.save(function (err) {	
		if (err) {
			console.log(err);
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
	PrPass
	.findOne({
		_id : id
	})
	.exec(function (err, pass) {
		if (err)
			return next(err);
		if (!pass)
			return next(new Error('Failed to load PrPass ' + id));
		req.profile = pass;
		next();
	});
};

/**
 * Update a pass
 */
exports.update = function (req, res) {
	var pass = req.profile;
	//console.log(pass);
	pass = _.extend(pass, req.body);
	pass.save(function (err) {
		res.jsonp(pass);
	});
};

/**
 * Delete an pass
 */
exports.destroy = function (req, res) {
	if (req.body._id) {
		delete req.body._id;
	}
	PrPass.findById(req.params.passId, function (err, pass) {
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

exports.getPrPassesByUser = function (req, res) {
	User
	.findById(req.user._id, function (err, user) {
		if (!user) {
			return res.status(500).send('Invalid User');
		} else {
			PrPass
			.find({
				owner : req.user._id
			})
			.sort({
				'group' : 1,
				'resourceName' : 1,
				'email' : 1
			})
			.exec(function (err, passes) {
				var result = groupBy(passes);
				res.jsonp(result);
			});
		}
	});
};
