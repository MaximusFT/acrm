'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  crypto = require('crypto');

/**
 * Pass Schema
 */

var PrPassSchema = new Schema({
  group : {
	type : String,
	default : 'Uncategorized'
  },
  implement : {
	type : String,
	default : '---'
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
  owner: {
	type: Schema.Types.ObjectId, 
	ref: 'User'
  },
  salt: String
});

/**
 * Pre-save hook
 */
/*PrPassSchema.pre('save', function(next) {
  if (this.isNew && this.provider === 'local' && this.password && !this.password.length)
    return next(new Error('Invalid password'));
  next();
});*/

/**
 * Methods
 */
PrPassSchema.methods = {

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

mongoose.model('PrPass', PrPassSchema);
