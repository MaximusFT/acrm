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
		type: Schema.ObjectId,
		ref: 'NewDepartment'
	},
	type: {
		type: Schema.ObjectId,
		ref: 'WebreqType'
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
	client: {
		type: Schema.ObjectId,
		ref: 'Client'
	},
	state: {
		type: Number,
		default: 0
		// 0 - unprocessed
		// 1 - processed
		// 2 - spam
		// -1 - removed
		// 3 - test
	},
	isRead: {
		type: Boolean
	}
});

mongoose.model('NewWebreq', NewWebreqSchema);
