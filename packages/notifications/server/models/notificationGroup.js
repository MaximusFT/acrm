'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var NotificationGroupSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    assignedTo: [{
        type: Schema.ObjectId,
        ref: 'User'
    }],
    comment: {
        type: String
    }
});

mongoose.model('NotificationGroup', NotificationGroupSchema);
