'use strict';

// The Package is past automatically as first parameter
module.exports = function(Currencymanager, app, auth, database) {

    var curmanager = require('../controllers/currencymanager');
    app.get('/api/getCurrencyPredictions', auth.requiresLogin, curmanager.getCurrencyPredictions);
    app.get('/api/getCurrencyPredictionsOutside', curmanager.getCurrencyPredictionsOutside);
    app.post('/api/saveCurrencyPredictions', auth.requiresLogin, curmanager.saveCurrencyPredictions);

    var mailSender = require('../controllers/mailSender');
    app.post('/api/sendInstructions', auth.requiresLogin, mailSender.sendInstructions);
    app.post('/api/sendInstructions2', auth.requiresLogin, mailSender.sendInstructions2);
};
