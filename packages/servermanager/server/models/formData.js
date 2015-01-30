'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var FormDataSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    id: {
        type: String,
        required: true
    },
    appointment: {
        type: String,
        required: true
    },
    form: {
        type: Schema.ObjectId,
        ref: 'Form'
    }
});

mongoose.model('FormData', FormDataSchema);
