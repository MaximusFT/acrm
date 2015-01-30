'use strict';

// The Package is past automatically as first parameter
module.exports = function(Servermanager, app, auth, database) {
    var servermanager = require('../controllers/servermanager.js'),
        sitemanager = require('../controllers/sitemanager.js');

    app.post('/api/server', auth.requiresAdmin, servermanager.create);
    app.get('/api/servers', auth.requiresAdmin, servermanager.servers);
    app.get('/api/server', auth.requiresAdmin, servermanager.server);
    app.delete('/api/server', auth.requiresAdmin, servermanager.deleteServer);

    app.post('/api/site', auth.requiresAdmin, sitemanager.create);
};
