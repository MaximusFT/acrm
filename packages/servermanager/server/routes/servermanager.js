'use strict';

// The Package is past automatically as first parameter
module.exports = function(servers, app, auth, database) {
    var servermgr = require('../controllers/servers.js'),
        sites = require('../controllers/sites.js'),
        forms = require('../controllers/forms.js'),
        requests = require('../controllers/requests.js');

    app.post('/api/server', auth.requiresAdmin, servermgr.create);
    app.get('/api/servers', auth.requiresAdmin, servermgr.servers);
    app.get('/api/server', auth.requiresAdmin, servermgr.server);
    app.delete('/api/server', auth.requiresAdmin, servermgr.deleteServer);
    app.put('/api/server/:server', auth.requiresAdmin, servermgr.updateServer);

    app.post('/api/site', auth.requiresAdmin, sites.create);
    app.delete('/api/servers/site/:site', auth.requiresAdmin, sites.deleteSite);
    app.put('/api/servers/site/:site', auth.requiresAdmin, sites.updateSite);
    app.get('/api/servers/site/:site', auth.requiresAdmin, sites.getSite);

    app.get('/api/forms', auth.requiresAdmin, forms.forms);
    app.post('/api/form', auth.requiresAdmin, forms.create);
    app.get('/api/form', auth.requiresAdmin, forms.form);
    app.delete('/api/form/:form', auth.requiresAdmin, forms.delete);
    app.put('/api/form/:form', auth.requiresAdmin, forms.update);

    app.post('/api/formData', auth.requiresAdmin, forms.formData);
    app.delete('/api/formData/:formData', auth.requiresAdmin, forms.deleteFormData);

    app.get('/api/getDocumentFields', requests.getDocumentFields);
    app.post('/api/sendUserRequest', requests.processUserRequest);
};
