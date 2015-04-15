'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var NotificationSchema = new Schema({
    targetUser: {
        type: Schema.ObjectId,
        ref: 'User',
        required: true
    },
    message: {
        type: String,
        required: true
    },
    category: {
        type: Number,
        required: true
    },
    event: {
        type: Schema.ObjectId,
        ref: 'SEvent',
        required: true
    },
    state: {                    //0 - unread
        type: Number,           //1 - read
        default: 0              //2 - bookmarked
    },
    time: {
        type: Date,
        default: Date.now
    }
});

mongoose.model('Notification', NotificationSchema);
