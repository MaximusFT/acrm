'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var WebreqTypeSchema = new Schema({
	title: {
		type: String,
		required: true
	}
});

mongoose.model('WebreqType', WebreqTypeSchema);
