'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var SiteSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    uri: {
        type: String,
        required: true,
        unique: true
    },
    ip: {
        type: String,
        required: true
    },
    server: {
        type: Schema.ObjectId,
        ref: 'Server',
        required: true
    },
    comment: {
        type: String
    }
});

mongoose.model('Site', SiteSchema);
