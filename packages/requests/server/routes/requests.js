'use strict';

// User routes use requests controller
var requests = require('../controllers/requests');

module.exports = function(MeanRequest, app, auth, database, passport) {

  // Setting up the requestId param
  app.param('requestId', requests.request);

};