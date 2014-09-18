'use strict';

// The Package is past automatically as first parameter
module.exports = function(Manager, app, auth, database) {

    //Setting up the passwords api
    var passwords = require('../controllers/passwords');
    app.get('/api/passes', auth.requiresAdmin, passwords.all);
	app.get('/api/passes/:passId', auth.requiresAdmin, passwords.pass);
    app.post('/api/passes', auth.requiresAdmin, passwords.create);
    app.put('/api/passes/:passId', auth.requiresAdmin, passwords.update);
    app.delete('/api/passes/:passId', auth.requiresAdmin, passwords.destroy);
	
	 //Setting up the users api
    var users = require('../controllers/users');
    app.get('/api/users', auth.requiresAdmin, users.all);
    app.post('/api/users', auth.requiresAdmin, users.create);
    app.put('/api/users/:userId', auth.requiresAdmin, users.update);
    app.delete('/api/users/:userId', auth.requiresAdmin, users.destroy);
	
	app.get('/api/user', auth.requiresLogin, users.user);
	app.get('/api/fromDepartment', auth.requiresLogin, users.department);
};
