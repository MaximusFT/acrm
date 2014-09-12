'use strict';

// User routes use passwords controller
var passwords = require('../controllers/passwords');

module.exports = function(MeanPass, app, auth, database, passport) {

  // Setting up the userId param
  app.param('passId', passwords.pass);

};