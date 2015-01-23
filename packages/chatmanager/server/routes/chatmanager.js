'use strict';

// The Package is past automatically as first parameter
module.exports = function(Chatmanager, app, auth, database) {
    var chatmanager = require('../controllers/chatmanager');
    app.get('/api/getChatStats', auth.requiresLogin, chatmanager.getChatStats);
    app.put('/api/changeGuestMode', auth.requiresLogin, chatmanager.changeGuestMode);
    app.get('/api/getGuestMode', auth.requiresLogin, chatmanager.getGuestMode);
};
