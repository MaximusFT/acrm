'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    crypto = require('crypto');

var PassSchema = new Schema({
    group: {
        type: String,
        default: 'Uncategorized'
    },
    implement: {
        type: String,
        default: '---'
    },
    resourceName: {
        type: String,
        required: true
    },
    resourceUrl: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    login: {
        type: String,
        //unique: true,
        required: true
    },
    hashed_password: {
        type: String
    },
    comment: {
        type: String,
        default: '—'
    },
    accessedFor: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    forServer: {
        type: Schema.Types.ObjectId,
        ref: 'Server'
    },
    forSite: {
        type: Schema.Types.ObjectId,
        ref: 'Site'
    },
    salt: String
});

PassSchema.virtual('password').set(function(password) {
    this._password = password;
    this.salt = this.makeSalt();
    this.hashed_password = this.hashPassword(password);
}).get(function() {
    return this._password;
});

/*PassSchema.pre('save', function(next) {
  if (this.isNew && this.provider === 'local' && this.password && !this.password.length)
    return next(new Error('Invalid password'));
  next();
});*/

PassSchema.methods = {

    /**
     * Make salt
     *
     * @return {String}
     * @api public
     */
    makeSalt: function() {
        return crypto.randomBytes(16).toString('base64');
    },

    /**
     * Hash password
     *
     * @param {String} password
     * @return {String}
     * @api public
     */
    hashPassword: function(password) {
        /*if (!password || !this.salt) return '';
        var salt = new Buffer(this.salt, 'base64');
        return crypto.pbkdf2Sync(password, salt, 10000, 64).toString('base64');*/
        return password;
    }
};

mongoose.model('Pass', PassSchema);
