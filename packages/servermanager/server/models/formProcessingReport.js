'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var FormProcessingReportSchema = new Schema({
	form: {
		type: Schema.ObjectId,
		ref: 'Form',
		required: true
	},
	formData: {
		type: Schema.Types.Mixed,
		required: true
	},
	actionsPerformed: {
		type: Array
	},
	error: {
		type: Array
	},
	whenProcessed: {
		type: Date,
		default: Date.now
	}
});

mongoose.model('FormProcessingReport', FormProcessingReportSchema);
