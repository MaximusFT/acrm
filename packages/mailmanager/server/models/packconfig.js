'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var packagesConfigSchema = new Schema({
    packageName: String,
    data: Schema.Types.Mixed
});

mongoose.model('PackConfig', packagesConfigSchema);