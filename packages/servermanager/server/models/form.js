'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var FormSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    formId: {
        type: String,
        required: true
    },
    uri: {
        type: String,
        required: true
    },
    throughAllSite: {
        type: Boolean
    },
    site: {
        type: Schema.ObjectId,
        ref: 'Site'
    },
    actions: [{
        type: Schema.Types.Mixed
    }],
    comment: {
        type: String
    }
});

mongoose.model('Form', FormSchema);
