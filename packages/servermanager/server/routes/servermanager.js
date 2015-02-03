'use strict';

// The Package is past automatically as first parameter
module.exports = function(Servermanager, app, auth, database) {
    var servermanager = require('../controllers/servermanager.js'),
        sites = require('../controllers/sites.js'),
        forms = require('../controllers/forms.js');

    app.post('/api/server', auth.requiresAdmin, servermanager.create);
    app.get('/api/servers', auth.requiresAdmin, servermanager.servers);
    app.get('/api/server', auth.requiresAdmin, servermanager.server);
    app.delete('/api/server', auth.requiresAdmin, servermanager.deleteServer);
    app.put('/api/server/:server', auth.requiresAdmin, servermanager.updateServer);

    app.post('/api/site', auth.requiresAdmin, sites.create);
    app.delete('/api/servers/site/:site', auth.requiresAdmin, sites.deleteSite);
    app.put('/api/servers/site/:site', auth.requiresAdmin, sites.updateSite);
    app.get('/api/servers/site/:site', auth.requiresAdmin, sites.getSite);

    app.get('/api/forms', auth.requiresAdmin, forms.forms);
    app.post('/api/form', auth.requiresAdmin, forms.create);
    app.get('/api/form', auth.requiresAdmin, forms.form);
    app.delete('/api/form/:form', auth.requiresAdmin, forms.delete);

    app.post('/api/formData', auth.requiresAdmin, forms.formData);
    app.delete('/api/formData/:formData', auth.requiresAdmin, forms.deleteFormData);
};
