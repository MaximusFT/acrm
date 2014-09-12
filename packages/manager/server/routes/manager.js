'use strict';

// The Package is past automatically as first parameter
module.exports = function(Manager, app, auth, database) {

    //Setting up the passwords api
    var passwords = require('../controllers/passwords');
    app.get('/manager/passes', auth.requiresAdmin, passwords.all);
	app.get('/manager/passes/:passId', auth.requiresAdmin, passwords.pass);
    app.post('/manager/passes', auth.requiresAdmin, passwords.create);
    app.put('/manager/passes/:passId', auth.requiresAdmin, passwords.update);
    app.delete('/manager/passes/:passId', auth.requiresAdmin, passwords.destroy);
	
	 //Setting up the users api
    var users = require('../controllers/users');
    app.get('/manager/users', auth.requiresAdmin, users.all);
    app.post('/manager/users', auth.requiresAdmin, users.create);
    app.put('/manager/users/:userId', auth.requiresAdmin, users.update);
    app.delete('/manager/users/:userId', auth.requiresAdmin, users.destroy);
};
