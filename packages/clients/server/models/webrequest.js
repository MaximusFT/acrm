'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
Schema = mongoose.Schema;

/**
 * Mark Schema
 */
var WebreqSchema = new Schema({
		webreq_inside_id : {
			type : Number
		},
		webreq_type : {
			type : String
		},
		office_destination : {
			type : String
		},
		creation_date : {
			type : Date,
		default:
			Date.now
		},
		form_address : {
			type : String
		},
		link_source : {
			type : String
		},
		target_page : {
			type : String
		},
		lastname : {
			type : String
		},
		firstname : {
			type : String
		},
		middlename : {
			type : String
		},
		sex : {
			type : String,
			enum : ['male', 'female']
		},
		email : {
			type : String
		},
		phone : {
			type : String
		},
		comment : {
			type : String
		},
		utm_source : {
			type : String
		},
		utm_medium : {
			type : String
		},
		utm_campaign : {
			type : String
		},
		utm_term : {
			type : String
		},
		ip : {
			type : String
		},
		debug_info : {
			type : String
		}
	});

mongoose.model('Webreq', WebreqSchema);
