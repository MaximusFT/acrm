'use strict';

// User routes use departments controller
var departments = require('../controllers/departments');

module.exports = function(MeanPass, app, auth, database, passport) {

  // Setting up the userId param
  app.param('departmentId', departments.department);

};