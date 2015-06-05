'use strict';

// The Package is past automatically as first parameter
module.exports = function(servers, app, auth, database) {
    var servermgr = require('../controllers/servers.js'),
        sites = require('../controllers/sites.js'),
        forms = require('../controllers/forms.js');

    app.post('/api/server', auth.requiresAdminAndKostya, servermgr.create);
    app.get('/api/servers_', auth.requiresAdminAndKostya, servermgr.servers);
    app.get('/api/server', auth.requiresAdminAndKostya, servermgr.server);
    app.delete('/api/server', auth.requiresAdminAndKostya, servermgr.deleteServer);
    app.put('/api/server/:server', auth.requiresAdminAndKostya, servermgr.updateServer);

    app.post('/api/site', auth.requiresAdminAndKostya, sites.create);
    app.get('/api/sites', auth.requiresAdminAndKostya, sites.sites);
    app.delete('/api/site/:site', auth.requiresAdminAndKostya, sites.deleteSite);
    app.put('/api/site/:site', auth.requiresAdminAndKostya, sites.updateSite);
    app.get('/api/site/:site', auth.requiresAdminAndKostya, sites.getSite);

    app.get('/api/forms', auth.requiresAdminAndKostya, forms.forms);
    app.post('/api/form', auth.requiresAdminAndKostya, forms.create);
    app.get('/api/form', auth.requiresAdminAndKostya, forms.form);
    app.delete('/api/form/:form', auth.requiresAdminAndKostya, forms.delete);
    app.put('/api/form/:form', auth.requiresAdminAndKostya, forms.update);

    app.post('/api/formData', auth.requiresAdminAndKostya, forms.formData);
    app.delete('/api/formData/:formData', auth.requiresAdminAndKostya, forms.deleteFormData);
};
