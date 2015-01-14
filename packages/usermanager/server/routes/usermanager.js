'use strict';

// The Package is past automatically as first parameter
module.exports = function(Usermanager, app, auth, database) {

  var users = require('../controllers/users');
    app.get('/api/users', auth.requiresLogin, users.all);
    app.post('/api/users', auth.requiresLogin, users.create);
    app.put('/api/users/:userId', auth.requiresLogin, users.update);
    app.delete('/api/users/:userId', auth.requiresLogin, users.destroy);
	
	app.get('/api/getUser', auth.requiresLogin, users.getUser);
	app.get('/api/fromDepartment', auth.requiresLogin, users.department);
	app.get('/api/getUsers', auth.requiresLogin, users.groups);
	app.get('/api/searchUsers', auth.requiresLogin, users.searchUsers);
	app.post('/api/assignRole', auth.requiresAdmin, users.assignRole);
	app.post('/api/bindToDep', auth.requiresAdmin, users.bindToDep);
	app.post('/api/clearAccesses', auth.requiresAdmin, users.clearAccesses);
	app.get('/api/getForHead', auth.requiresAdmin, users.getForHead);
	
  var passwords = require('../controllers/passwords');
	app.get('/api/getPassesByUser', auth.requiresLogin, passwords.getPassesByUser);
	
  var departments = require('../controllers/departments');
	app.get('/api/departments', auth.requiresLogin, departments.all);
	app.get('/api/getDepartments', auth.requiresLogin, departments.allNames);
};
