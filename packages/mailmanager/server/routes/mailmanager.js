'use strict';

module.exports = function(Mailmanager, app, auth, database) {

    var mailmanager = require('../controllers/mailmanager.js');

    app.get('/api/synchronizemailboxes', auth.requiresAdmin, mailmanager.synchronizeMailBoxes);
    app.get('/api/getAllMailboxes', auth.requiresAdmin, mailmanager.getMailBoxes);
    app.get('/api/getConfig', auth.requiresAdmin, mailmanager.getConfig);
    app.post('/api/updateConfig', auth.requiresAdmin, mailmanager.updateConfig);
    app.post('/api/provideAccessForMailbox', auth.requiresAdmin, mailmanager.provideAccessForMailBox);
    app.post('/api/revokeAccessForMailbox', auth.requiresAdmin, mailmanager.revokeAccessForMailBox);
    app.get ('/api/getAccessibleMails', auth.requiresLogin, mailmanager.getAccessibleMails);
    app.post ('/api/getAccessibleMailsByName', auth.requiresLogin, mailmanager.getAccessibleMailsByName);  
    app.get ('/api/getMailConfig', auth.requiresLogin, mailmanager.getConfig);
    app.post ('/api/getOneMailbox', auth.requiresLogin, mailmanager.getOneMailBox);
};
