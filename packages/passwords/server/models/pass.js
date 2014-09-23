'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  crypto = require('crypto');

/**
 * Validations
 */
/*var validatePresenceOf = function(value) {
  // If you are authenticating by any of the oauth strategies, don't validate.
  return (this.provider && this.provider !== 'local') || (value && value.length);
};*/

/*var validateUniqueEmail = function(value, callback) {
  var Pass = mongoose.model('Pass');
  Pass.find({
    $and: [{
      email: value
    }, {
      _id: {
        $ne: this._id
      }
    }]
  }, function(err, pass) {
    callback(err || pass.length === 0);
  });
};*/

/**
 * Pass Schema
 */

var PassSchema = new Schema({
  group : {
	type : String,
	default : 'Uncategorized'
  },
  resourceName: {
    type: String,
    required: true
  },
  resourceUrl: {
    type: String,
    required: true
    //unique: true
    //match: ['_^(?:(?:https?|ftp)://)(?:\S+(?::\S*)?@)?(?:(?!10(?:\.\d{1,3}){3})(?!127(?:\.\d{1,3}){3})(?!169\.254(?:\.\d{1,3}){2})(?!192\.168(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\x{00a1}-\x{ffff}0-9]+-?)*[a-z\x{00a1}-\x{ffff}0-9]+)(?:\.(?:[a-z\x{00a1}-\x{ffff}0-9]+-?)*[a-z\x{00a1}-\x{ffff}0-9]+)*(?:\.(?:[a-z\x{00a1}-\x{ffff}]{2,})))(?::\d{2,5})?(?:/[^\s]*)?$_iuS', 'Please enter a valid url']
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
  accessedFor: {
    type: Array
    //default: ['nobody']
  },
  salt: String
});

/**
 * Virtuals
 */
PassSchema.virtual('password').set(function(password) {
  this._password = password;
  this.salt = this.makeSalt();
  this.hashed_password = this.hashPassword(password);
}).get(function() {
  return this._password;
});

/**
 * Pre-save hook
 */
/*PassSchema.pre('save', function(next) {
  if (this.isNew && this.provider === 'local' && this.password && !this.password.length)
    return next(new Error('Invalid password'));
  next();
});*/

/**
 * Methods
 */
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
