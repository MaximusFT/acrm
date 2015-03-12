'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var LogWebRequestSchema = new Schema({
	uri: {
		type: String
	},
	form: {
		type: String
	},
	formData: {
		type: Array
	},
	url_local: {
		type: String
	},
	url_referer: {
		type: String
	},
	browser: {
		type: Schema.Types.Mixed
	},
	ip1: {
		type: String
	},
	ip2: {
		type: Schema.Types.Mixed
	},
	time: {
		type: Date,
		default: Date.now
	}
});

mongoose.model('LogWebRequest', LogWebRequestSchema);
