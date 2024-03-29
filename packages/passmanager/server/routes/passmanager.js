'use strict';

// The Package is past automatically as first parameter
module.exports = function(Passmanager, app, auth, database) {

    var passwords = require('../controllers/passwords');
    app.get('/api/passes', auth.requiresAdmin, passwords.all);
    app.get('/api/getPass', auth.requiresAdmin, passwords.getPass);
    app.post('/api/passes', auth.requiresManager, passwords.create);
    app.put('/api/passes/:passId', auth.requiresManager, passwords.update);
    app.delete('/api/passes/:passId', auth.requiresAdmin, passwords.destroy);
    app.get('/api/getGroups', auth.requiresAdmin, passwords.groups);
    app.get('/api/getAcsGroups', auth.requiresManager, passwords.acsgroups);
    app.get('/api/getPassesByGroup', auth.requiresManager, passwords.passesByGroup);
    app.delete('/api/deletePass', auth.requiresAdmin, passwords.delPass);
    app.post('/api/provideAccess', auth.requiresManager, passwords.provideAccess);
    app.post('/api/revokeAccess', auth.requiresManager, passwords.revokeAccess);
    app.get('/api/getPassesByUser', auth.requiresLogin, passwords.getPassesByUser);
    app.post('/api/usersWithAccess', auth.requiresAdmin, passwords.usersWithAccess);
    app.post('/api/denyUserAccessToPass', auth.requiresAdmin, passwords.denyUserAccessToPass);
	
    /*var requests = require('../controllers/requests');
    app.post('/api/requests', auth.requiresLogin, requests.create);
    app.get('/api/requests', auth.requiresAdmin, requests.getReqs);
    app.post('/api/confirmReq', auth.requiresAdmin, requests.confirmRequest);
    app.post('/api/rejectReq', auth.requiresAdmin, requests.rejectRequest);*/

    var prpasswords = require('../controllers/prpasswords');
    app.post('/api/prpasses', auth.requiresLogin, prpasswords.create);
    app.put('/api/prpasses/:passId', auth.requiresLogin, prpasswords.update);
    app.delete('/api/prpasses/:passId', auth.requiresLogin, prpasswords.destroy);
    app.get('/api/getPrPass', auth.requiresLogin, prpasswords.pass);
    app.get('/api/getPrPassesByUser', auth.requiresLogin, prpasswords.getPrPassesByUser);
};
