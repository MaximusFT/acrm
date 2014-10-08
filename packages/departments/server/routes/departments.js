'use strict';

// User routes use departments controller
var departments = require('../controllers/departments');

module.exports = function(MeanDepartment, app, auth, database, passport) {

  // Setting up the departmentId param
  app.param('departmentId', departments.department);

};