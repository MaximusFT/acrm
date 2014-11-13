'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Ticket Schema
 */

var TicketSchema = new Schema({
  type: {
	type : Number,
	//0 - access
	//1 - suggestions
	required: true
  },
  from : {
	type : Schema.ObjectId,
	ref : 'User'
  },
  when: {
    type : String,
    required: true
  },
  subject : {
	type : String,
	required: true
  },
  correspondence: {
	type : Schema.Types.Mixed,
	required: true
  },
  status: {
	type : String
  }
});

/**
 * Virtuals
 */
TicketSchema.virtual('ticket').set(function(ticket) {
  this._ticket = ticket;
}).get(function() {
  return this._ticket;
});

mongoose.model('Ticket', TicketSchema);