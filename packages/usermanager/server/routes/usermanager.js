'use strict';

// The Package is past automatically as first parameter
module.exports = function(Usermanager, app, auth, database) {

    var users = require('../controllers/users');
    app.post('/api/users', auth.requiresManager, users.create, auth.eventHandler);
    app.put('/api/users/:userId', auth.requiresLogin, users.update, auth.eventHandler);
    app.delete('/api/users/:userId', auth.requiresManager, users.destroy, auth.eventHandler);
    app.post('/api/removeUsers', auth.requiresManager, users.removeUsers, auth.eventHandler);

    app.get('/api/getUser', auth.requiresLogin, users.getUser);
    app.get('/api/fromDepartment', auth.requiresLogin, users.department);
    app.get('/api/searchUsers', auth.requiresLogin, users.searchUsers);
    app.post('/api/assignRole', auth.requiresManager, users.assignRole, auth.eventHandler);
    app.post('/api/clearAccesses', auth.requiresManager, users.clearAccesses, auth.eventHandler);
    app.get('/api/getForHead', auth.requiresManager, users.getForHead);
};
