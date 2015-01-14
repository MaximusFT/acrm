'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * CurrencyPrediction Schema
 */

var CurrencyPredictionSchema = new Schema({
    cols: {
        type: Array,
        required: true
    },
    rows: {
        type: Array,
        required: true
    }
});

mongoose.model('CurrencyPrediction', CurrencyPredictionSchema);
