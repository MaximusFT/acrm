'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var FormBindedDataSchema = new Schema({
    name: {
        type: String
    },
    id: {
        type: String
    },
    appointment: {
        type: String,
        required: true
    },
    comment: {
        type: String
    },
    inForm: {
        type: Boolean
    },
    form: {
        type: Schema.ObjectId,
        ref: 'Form',
        required: true
    }
});

mongoose.model('FormBindedData', FormBindedDataSchema);
