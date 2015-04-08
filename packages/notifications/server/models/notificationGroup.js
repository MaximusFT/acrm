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
    },
    settings: {
        type: Schema.Types.Mixed,
        default: []
    }
});

mongoose.model('NotificationGroup', NotificationGroupSchema);
