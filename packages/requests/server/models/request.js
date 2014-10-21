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