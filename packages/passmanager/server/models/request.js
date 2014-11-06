'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Request Schema
 */

var RequestSchema = new Schema({
  type: {
	type : Number
	//0 - manager to admins (access)
	//1 - manager/employee to admins (add)
	//2 - manager/employee to admins (edit)
	//3 - employee to manager (access)
  },
  who : {
	type : Schema.ObjectId,
	ref : 'User'
  },
  what : {
	type : Schema.ObjectId,
	ref : 'Pass'
  },
  when: {
    type : String,
    required: true
  },
  comment: {
    type : String
  },
  info: {
	type : Schema.Types.Mixed
  }
});

/**
 * Virtuals
 */
RequestSchema.virtual('request').set(function(request) {
  this._request = request;
}).get(function() {
  return this._request;
});

mongoose.model('Request', RequestSchema);