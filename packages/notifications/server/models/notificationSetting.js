'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var NotificationSettingSchema = new Schema({
    code: {
        type: String
    },
    name: {
        type: String
    },
    group: {
        type: Schema.ObjectId,
        ref: 'NotificationGroup'
    },
    userOptions: [{
        user: {
            type: Schema.ObjectId,
            ref: 'User'
        },
        value: {
            type: Boolean
        }
    }]
});

mongoose.model('NotificationSetting', NotificationSettingSchema);
