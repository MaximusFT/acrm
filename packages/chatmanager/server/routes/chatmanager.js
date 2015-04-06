'use strict';

// The Package is past automatically as first parameter
module.exports = function(Chatmanager, app, auth, database) {
    var chatmanager = require('../controllers/chatmanager');
    app.get('/api/getChatStats', auth.requiresManager, chatmanager.getChatStats);
    app.put('/api/changeGuestMode', auth.requiresManager, chatmanager.changeGuestMode, auth.eventHandler);
    app.get('/api/getGuestMode', auth.requiresManager, chatmanager.getGuestMode);
    app.get('/api/getChatUsers', auth.requiresManager, chatmanager.getChatUsers);
    app.post('/api/getHistory', auth.requiresManager, chatmanager.getHistory);
};
