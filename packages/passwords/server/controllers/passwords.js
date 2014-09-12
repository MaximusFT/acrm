'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose');
var Pass = mongoose.model('Pass');

/**
 * Create pass
 */
exports.create = function(req, res, next) {
  var pass = new Pass(req.body);

  pass.provider = 'local';

  // because we set our pass.provider to local our models/pass.js validation will always be true
  //req.assert('resourceName', 'You must enter a resource title').notEmpty();

  var errors = req.validationErrors();
  if (errors) {
    return res.status(400).send(errors);
  }

  pass.save(function(err) {
    if (err) {
      switch (err.code) {
        default:
          var modelErrors = [];

          if (err.errors) {

            for (var x in err.errors) {
              modelErrors.push({
                param: x,
                msg: err.errors[x].message,
                value: err.errors[x].value
              });
            }

            res.status(400).send(modelErrors);
          }
      }

      return res.status(400);
    }
    res.status(200);
  });
};
/**
 * Send Pass
 */
exports.me = function(req, res) {
  res.json(req.pass || null);
};

/**
 * Find pass by id
 */
exports.pass = function(req, res, next, id) {
  Pass
    .findOne({
      _id: id
    })
    .exec(function(err, pass) {
      if (err) return next(err);
      if (!pass) return next(new Error('Failed to load Pass ' + id));
      req.profile = pass;
      next();
    });
};