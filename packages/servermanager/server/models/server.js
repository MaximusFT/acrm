'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var ServerSchema = new Schema({
    ip: {
        type: String,
        required: true,
        unique: true
    },
    ips: {
        type: Array
    },
    convName: {
        type: String
    },
    location: {
        type: String,
        required: true
    },
    type: {
        type: Number, // 0 - Server, 1 - VDS
        required: true
    }
});

mongoose.model('Server', ServerSchema);
