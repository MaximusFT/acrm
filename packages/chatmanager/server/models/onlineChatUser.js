'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * OnlineChatUsers Schema
 */

var OnlineChatUsersSchema = new Schema({
    user: {
        type: Schema.ObjectId,
        ref: 'User'
    },
    client: {
        type: Schema.ObjectId,
        ref: 'Client'
    },
    username: {
        type: String,
        required: true
    },
    socket: {
        type: String,
        required: true
    }
});

mongoose.model('OnlineChatUser', OnlineChatUsersSchema);
