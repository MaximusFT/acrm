'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var ChatOptionsSchema = new Schema({
    isGuestModeEnabled: {
        type: Boolean
    }
});

mongoose.model('ChatOption', ChatOptionsSchema);
