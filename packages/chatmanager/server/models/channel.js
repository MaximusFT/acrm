'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
Schema = mongoose.Schema;

/**
 * Channel Schema
 */

var ChannelSchema = new Schema({
		name : {
			type : String,
			required : true
		},
		between : {
			type: Array
		}
	});

mongoose.model('Channel', ChannelSchema);