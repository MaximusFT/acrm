'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * Department Schema
 */

var DepartmentSchema = new Schema({
    name: {
        type: String,
        unique: true,
        required: true
    },
    head: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    parents: {
        type: Array
    },
    level: {
        type: Number,
        required: true
    }
});

mongoose.model('Department', DepartmentSchema);
