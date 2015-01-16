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
    title: {
        type: String,
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
    },
    additionalInfo: {
        type: Schema.Types.Mixed
    }
});

mongoose.model('NewDepartment', DepartmentSchema);
