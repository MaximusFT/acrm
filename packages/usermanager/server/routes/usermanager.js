'use strict';

// The Package is past automatically as first parameter
module.exports = function(Usermanager, app, auth, database) {

  var users = require('../controllers/users');
    app.get('/api/users', auth.requiresAdmin, users.all);
    app.post('/api/users', auth.requiresAdmin, users.create);
    app.put('/api/users/:userId', auth.requiresAdmin, users.update);
    app.delete('/api/users/:userId', auth.requiresAdmin, users.destroy);
	
	app.get('/api/getUser', auth.requiresLogin, users.getUser);
	app.get('/api/fromDepartment', auth.requiresLogin, users.department);
	app.get('/api/getUsers', auth.requiresLogin, users.groups);
	
};
