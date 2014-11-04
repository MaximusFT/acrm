'use strict';

// The Package is past automatically as first parameter
module.exports = function(Passmanager, app, auth, database) {

 var passwords = require('../controllers/passwords');
    app.get('/api/passes', auth.requiresLogin, passwords.all);
	app.get('/api/getPass', auth.requiresLogin, passwords.getPass);
    app.post('/api/passes', auth.requiresLogin, passwords.create);
    app.put('/api/passes/:passId', auth.requiresLogin, passwords.update);
    app.delete('/api/passes/:passId', auth.requiresLogin, passwords.destroy);
	app.get('/api/getGroups', auth.requiresLogin, passwords.groups);
	app.get('/api/getAcsGroups', auth.requiresLogin, passwords.acsgroups);
	app.get('/api/getPassesByGroup', auth.requiresLogin, passwords.passesByGroup);
	app.delete('/api/deletePass', auth.requiresLogin, passwords.delPass);
	app.post('/api/provideAccess', auth.requiresAdmin, passwords.provideAccess);
	app.post('/api/revokeAccess', auth.requiresAdmin, passwords.revokeAccess);
	app.get('/api/getDeps', auth.requiresLogin, passwords.getDeps);
	
  var requests = require('../controllers/requests');
	app.post('/api/requests', auth.requiresLogin, requests.create);
	app.get('/api/requests', auth.requiresAdmin, requests.all);
	app.get('/api/provideAccess', auth.requiresAdmin, requests.provideAccess);
	app.get('/api/rejectRequest', auth.requiresAdmin, requests.rejectRequest);
	
  var prpasswords = require('../controllers/prpasswords');
	app.post('/api/prpasses', auth.requiresLogin, prpasswords.create);
	app.put('/api/prpasses/:passId', auth.requiresLogin, passwords.update);
	app.delete('/api/prpasses/:passId', auth.requiresLogin, prpasswords.destroy);
	app.get('/api/getPrPass', auth.requiresLogin, prpasswords.pass);
	app.get('/api/getPrPassesByUser', auth.requiresLogin, prpasswords.getPrPassesByUser);
};