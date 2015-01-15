'use strict';

// The Package is past automatically as first parameter
module.exports = function(Currencymanager, app, auth, database) {

    var curmanager = require('../controllers/currencymanager');
    app.get('/api/getCurrencyPredictions', auth.requiresLogin, curmanager.getCurrencyPredictions);
    app.get('/api/getCurrencyPredictionsOutside', curmanager.getCurrencyPredictionsOutside);
    app.post('/api/saveCurrencyPredictions', auth.requiresLogin, curmanager.saveCurrencyPredictions);
};
