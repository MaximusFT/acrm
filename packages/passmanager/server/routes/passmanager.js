'use strict';

// The Package is past automatically as first parameter
module.exports = function(Passmanager, app, auth, database) {

 var passwords = require('../controllers/passwords');
    app.get('/api/passes', auth.requiresAdmin, passwords.all);
	app.get('/api/getPass', auth.requiresAdmin, passwords.getPass);
    app.post('/api/passes', auth.requiresAdmin, passwords.create);
    app.put('/api/passes/:passId', auth.requiresAdmin, passwords.update);
    app.delete('/api/passes/:passId', auth.requiresAdmin, passwords.destroy);
	app.get('/api/getGroups', auth.requiresLogin, passwords.groups);
	app.get('/api/getPassesByGroup', auth.requiresLogin, passwords.passesByGroup);
	app.delete('/api/deletePass', auth.requiresLogin, passwords.delPass);
};
