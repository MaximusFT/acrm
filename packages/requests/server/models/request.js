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
	type : String,
	required : true
  },
  what : {
	type : String,
	required : true
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