'use strict';

module.exports = function(Admin, app, auth, database) {

    var users = require('../controllers/users'),
        //settings = require('../controllers/settings'),
        features = require('../controllers/features');

    app.post('/api/isAdmin', auth.requiresLogin, users.isAdmin);
    app.post('/api/mode', auth.requiresLogin, users.getMode);

    /*app.get('/admin/settings', auth.requiresAdmin, settings.get);
    app.put('/admin/settings', auth.requiresAdmin, settings.save);*/

    app.get('/api/features', auth.requiresAdmin, features.features);
    app.post('/api/feature', auth.requiresAdmin, features.feature);
    app.delete('/api/feature/:featureId', auth.requiresAdmin, features.deleteFeature);
    app.post('/api/provideFeature', auth.requiresAdmin, features.provideFeature);
    app.post('/api/revokeFeature', auth.requiresAdmin, features.revokeFeature);
    app.get('/api/isFeatures', auth.requiresLogin, features.isFeatures);
    app.get('/api/getMyFeatures', auth.requiresLogin, features.getMyFeatures);
    app.get('/api/checkAccessFeature', auth.requiresLogin, features.checkAccessFeature);

};
