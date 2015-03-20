'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * Message Schema
 */

var MessageSchema = new Schema({
    user: {
        type: Schema.ObjectId,
        ref: 'User'
    },
    client: {
        type: Schema.ObjectId,
        ref: 'Client'
    },
    channel: {
        type: Schema.ObjectId,
        ref: 'Channel',
        required: true
    },
    message: {
        type: String,
        required: true
    },
    attachment: {
        type: Array,
    },
    time: {
        type: Date,
        default: Date.now
    }
});

mongoose.model('Message', MessageSchema);
