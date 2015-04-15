'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var EventSchema = new Schema({
    category: {                         //0 - activities
        type: Number,                   //1 - messages
        required: true                  //2 - tasks
    },
    code: {
        type: String,                   //Generation rule:
        required: true                  //{{package_code}}:{{action_code}}:{{uniq_code}}
    },
    level: {
        type: String,
        enum: ['info', 'warn', 'danger', 'error'],
        required: true
    },
    targetGroup: [{
        type: String
    }],
    targetPersons: [{
        type: Schema.ObjectId,
        ref: 'User'
    }],
    title: {
        type: String,
        required: true
    },
    link: {
        type: String
    },
    initGroup: {
        type: String
    },
    initPerson: {
        type: Schema.ObjectId,
        ref: 'User'
    },
    extraInfo: {
        type: Schema.Types.Mixed
    },
    whenEmited: {
        type: Date,
        default: Date.now
    }
});

mongoose.model('SEvent', EventSchema);
