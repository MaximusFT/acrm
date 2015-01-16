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
    manager: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    parent: {
        type: Number,
        required: true
    },
    left: {
        type: Number,
        required: true
    },
    right: {
        type: Number,
        required: true
    }
});

/**
 * Virtuals
 */
DepartmentSchema.virtual('department').set(function(department) {
    this._department = department;
}).get(function() {
    return this._department;
});

mongoose.model('Department', DepartmentSchema);
