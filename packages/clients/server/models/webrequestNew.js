'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var NewWebreqSchema = new Schema({
	name: {
		type: String
	},
	email: {
		type: String
	},
	phone: {
		type: String
	},
	department: {
		type: Schema.ObjectId
	},
	comment: {
		type: String
	},
	additionalInfo: {
		type: Schema.Types.Mixed
	},
	fromForm: {
		type: Schema.ObjectId,
		ref: 'Form'
	},
	analyticsInfo: {
		type: Schema.Types.Mixed
	},
	created: {
		type: Date,
		default: Date.now
	},
	isTest: {
		type: Boolean,
		default: false
	},
	client: {
		type: Schema.ObjectId,
		ref: 'Client'
	},
	state: {
		type: Number,
		default: 0
		// 0 - unprocessed
		// 1 - processed
		// -1 - removed
	}
});

mongoose.model('NewWebreq', NewWebreqSchema);
