'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var FormSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    formID: {
        type: String,
        required: true
    },
    URI: {
        type: String,
        required: true
    },
    site: {
        type: Schema.ObjectId,
        ref: 'Site'
    },
    comment: {
        type: String
    }
});

mongoose.model('Form', FormSchema);
