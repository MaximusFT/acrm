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
	console.log(req.query);
	if (!req.query.type) {
		return res.status(500).send('Empty request');
	}
	var query = {};
	query.type = req.query.type;
	if (!req.query.status)
		query.status = 0;
	Ticket
	.find(query)
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
	if (!ticketId || !answer) {
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
	var query = {};
	query.from = req.user._id;
	if(typeof req.query.status !== 'undefined')
		query.status = req.query.status;
	Ticket
	.find(query)
	.populate('from')
	.exec(function (err, tickets) {
		if (err) {
			return res.json(500, {
				error : err
			});
		} else {
			return res.jsonp(tickets);
		}
	});
};

exports.refreshTicket = function (req, res) {
	if (!req.query.ticketId || !req.query.count || (typeof req.query.count !== 'undefined' && isNaN(parseInt(req.query.count))))
		return res.status(500).send('Empty query');
	var count = parseInt(req.query.count);
	Ticket
	.findOne({
		_id : req.query.ticketId
	})
	.populate('from')
	.exec(function (err, ticket) {
		if (err) {
			return res.status(500).send(err);
		} else {
			if (count < ticket.correspondence.length)
				return res.jsonp({
					status : ticket.status,
					msgs : ticket.correspondence.slice(Math.max(ticket.correspondence.length - (ticket.correspondence.length - count), 1))
				});
			return res.jsonp({status : ticket.status});
		}
	});
};

exports.closeTicket = function (req, res) {
	var ticketId = req.body.params.ticketId;
	var when_closed = req.body.params.when_closed;
	if (!ticketId || !when_closed)
		return res.status(500).send('Empty query');
	Ticket
	.update({
		_id : ticketId
	}, {
		$set : {
			status : 1,
			when_closed : when_closed
		}
	})
	.exec(function (err, ticket) {
		if (err)
			return res.status(500).send(err);
		return res.status(200).send('ok');
	});
};
