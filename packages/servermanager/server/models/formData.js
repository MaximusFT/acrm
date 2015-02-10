'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var FormBindedDataSchema = new Schema({
    htmlId: {
        type: String,
        required: true
    },
    comment: {
        type: String
    },
    form: {
        type: Schema.ObjectId,
        ref: 'Form',
        required: true
    }
});

mongoose.model('FormBindedData', FormBindedDataSchema);
