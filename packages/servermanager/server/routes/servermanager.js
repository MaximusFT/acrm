'use strict';

// The Package is past automatically as first parameter
module.exports = function(servers, app, auth, database) {
    var servermgr = require('../controllers/servers.js'),
        sites = require('../controllers/sites.js'),
        forms = require('../controllers/forms.js');

    app.post('/api/server', auth.requiresAdmin, servermgr.create, auth.eventHandler);
    app.get('/api/servers_', auth.requiresAdmin, servermgr.servers);
    app.get('/api/server', auth.requiresAdmin, servermgr.server);
    app.delete('/api/server', auth.requiresAdmin, servermgr.deleteServer, auth.eventHandler);
    app.put('/api/server/:server', auth.requiresAdmin, servermgr.updateServer, auth.eventHandler);

    app.post('/api/site', auth.requiresAdmin, sites.create, auth.eventHandler);
    app.get('/api/sites', auth.requiresAdmin, sites.sites);
    app.delete('/api/site/:site', auth.requiresAdmin, sites.deleteSite, auth.eventHandler);
    app.put('/api/site/:site', auth.requiresAdmin, sites.updateSite);
    app.get('/api/site/:site', auth.requiresAdmin, sites.getSite);

    app.get('/api/forms', auth.requiresAdmin, forms.forms);
    app.post('/api/form', auth.requiresAdmin, forms.create, auth.eventHandler);
    app.get('/api/form', auth.requiresAdmin, forms.form);
    app.delete('/api/form/:form', auth.requiresAdmin, forms.delete, auth.eventHandler);
    app.put('/api/form/:form', auth.requiresAdmin, forms.update, auth.eventHandler);

    app.post('/api/formData', auth.requiresAdmin, forms.formData);
    app.delete('/api/formData/:formData', auth.requiresAdmin, forms.deleteFormData);
};
