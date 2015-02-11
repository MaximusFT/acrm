'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var mailBoxSchema = new Schema({
    title: String,
    //password: String,
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
    deleted: {
        type: Boolean,
        default: false
    },
    accessedFor: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    // quota: [{ current: Number, max: Number }]
    // comments: [{ body: String, date: Date }],
    // date: { type: Date, default: Date.now },
    // hidden: Boolean,
    // meta: {
    //   votes: Number,
    //   favs:  Number
    // }
});

mailBoxSchema.pre('save', function(next) {
    if (!this.mail)
        this.mail = this.title + '@' + this.domain;
    next();
});

mongoose.model('mailBox', mailBoxSchema);
