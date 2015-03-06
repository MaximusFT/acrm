'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var mailBoxSchema = new Schema({
    title: String,
    domain: String,
    state: {
        type: Number,
        enum: [0, 1]
    },
    comment: String,
    created: {
        type: Date,
        default: Date.now
    },
    mail: {
        type: String,
        unique: true
    },
    quota: Number,
    messages: Number,
    deleted: {
        type: Boolean,
        default: false
    },
    accessedFor: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
});
mailBoxSchema.pre('save', function(next) {
    if (!this.mail)
        this.mail = this.title + '@' + this.domain;
    next();
});
mongoose.model('mailBox', mailBoxSchema);
