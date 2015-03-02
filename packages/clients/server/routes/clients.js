'use strict';

// The Package is past automatically as first parameter
module.exports = function(Clients, app, auth, database) {

    var webreqs = require('../controllers/webreqs.js'),
        requests = require('../controllers/requests.js');

    app.post('/webform/crm/web_request_form_add', webreqs.web_request_form_add);
    app.get('/api/webreqs', auth.requiresAdmin, webreqs.webreqs);
    app.get('/api/oldWebreqs', auth.requiresAdmin, webreqs.oldWebreqs);
    app.get('/api/phonesForWebinars', auth.requiresAdmin, webreqs.phonesForWebinars);
    app.get('/api/acrmRequestTypes', auth.requiresLogin, webreqs.acrmRequestTypes);
    app.post('/api/applyFilters', auth.requiresAdmin, webreqs.applyFilters);
    app.put('/api/changeWebreqState/:webreqId', auth.requiresAdmin, webreqs.changeWebreqState);
    app.get('/api/webreqs/reports', auth.requiresAdmin, webreqs.reports);
    app.get('/api/webrequest/:webreqId', auth.requiresAdmin, webreqs.webreq);
    app.get('/api/reportForWebreq/:webreqId', auth.requiresAdmin, webreqs.reportForWebreq);

    app.get('/api/getDocumentFields', requests.getDocumentFields);
    app.post('/api/sendUserRequest', requests.processUserRequest);
    app.get('/api/requestTypes', auth.requiresAdmin, requests.requestTypes);
};
