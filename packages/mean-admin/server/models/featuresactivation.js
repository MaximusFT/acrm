'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * FeaturesActivation Schema
 */

var FeaturesActivationSchema = new Schema({
    user: {
        type: Schema.ObjectId,
        ref: 'User'
    },
    client: {
        type: Schema.ObjectId,
        ref: 'Client'
    },
    activated: {
        type: Array,
        default: []
    }
});

mongoose.model('FeaturesActivation', FeaturesActivationSchema);
