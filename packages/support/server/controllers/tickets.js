'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
Ticket = mongoose.model('Ticket'),
//User = mongoose.model('User'),
_ = require('lodash');

/**
 * Create ticket
 */
exports.create = function (req, res, next) {
	req.body.from = req.user._id;
	var ticket = new Ticket(req.body);

	var errors = req.validationErrors();
	//console.log(errors);
	if (errors) {
		return res.status(400).send(errors);
	}

	ticket.save(function (err) {
		//console.log(err);
		if (err) {
			switch (err.code) {
			default:
				res.status(400).send('Please fill all the required fields');
			}

			return res.status(400);
		}
		res.jsonp(ticket);
	});
};

/**
 * Find ticket by id
 */
exports.ticket = function (req, res, next, id) {
	Ticket
	.findOne({
		_id : id
	})
	.exec(function (err, ticket) {
		if (err)
			return next(err);
		if (!ticket)
			return next(new Error('Failed to load Ticket ' + id));
		req.profile = ticket;
		next();
	});
};
/**
 * Update a ticket
 */
exports.update = function (req, res) {
	var ticket = req.profile;
	//console.log(ticket);
	ticket = _.extend(ticket, req.body);
	ticket.save(function (err) {
		res.jsonp(ticket);
	});
};

/**
 * Delete an ticket
 */
exports.destroy = function (req, res) {
	if (req.body._id) {
		delete req.body._id;
	}
	Ticket.findById(req.params.ticketId, function (err, ticket) {
		//if (err) { return handleError(res, err); }
		if (!ticket) {
			return res.send(404);
		}
		_.extend(ticket, req.body);
		ticket.remove(function (err) {
			if (err) {
				res.render('error', {
					status : 500
				});
			} else {
				res.jsonp(ticket);
			}
		});
	});
};

/**
 * List of Tickets
 */
exports.all = function (req, res) {
	if(!req.query.type) {
		return res.status(500).send('Empty request');
	}
	Ticket
	.find({
		type : req.query.type
	})
	.populate('from')
	.exec(function (err, tickets) {
		if (err) {
			res.render('error', {
				status : 500
			});
		} else {
			return res.jsonp(tickets);
		}
	});
};

exports.reply = function (req, res) {
	var ticketId = req.body.ticketId;
	var answer = req.body.answer;
	if(!ticketId || !answer) {
		return res.status(500).send('Empty request');
	}
	Ticket
	.update({
		_id : ticketId
	}, {
		$addToSet : {
			'correspondence' : answer
		}
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

exports.myOpenedTickets = function (req, res) {
	Ticket
	.find({
		from : req.user._id
	})
	.exec(function(err, tickets) {
		if(err) {
			return res.json(500, {
				error : err
			});
		} else {
			return res.jsonp(tickets);
		}
	});
};