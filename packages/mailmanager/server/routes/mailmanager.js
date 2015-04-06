'use strict';

module.exports = function(Mailmanager, app, auth, database) {

    var mailmanager = require('../controllers/mailmanager.js');

    app.get('/api/synchronizemailboxes', auth.requiresAdmin, mailmanager.synchronizemailboxes, auth.eventHandler);
    app.get('/api/getAllMailboxes', auth.requiresAdmin, mailmanager.getmailboxes);
    app.get('/api/getAllMailboxesNoSort', auth.requiresAdmin, mailmanager.getMailboxesNoSort);
    app.get('/api/getConfig', auth.requiresAdmin, mailmanager.getConfig);
    app.post('/api/updateConfig', auth.requiresAdmin, mailmanager.updateConfig);
    app.post('/api/provideAccessForMailbox', auth.requiresAdmin, mailmanager.provideAccessForMailbox);
    app.post('/api/revokeAccessForMailbox', auth.requiresAdmin, mailmanager.revokeAccessForMailbox);
    app.get ('/api/getAccessibleMails', auth.requiresLogin, mailmanager.getAccessibleMails);
    app.post ('/api/getAccessibleMailsByName', auth.requiresAdmin, mailmanager.getAccessibleMailsByName);  
    app.get ('/api/getMailConfig', auth.requiresAdmin, mailmanager.getConfig);
    app.post ('/api/getOneMailbox', auth.requiresLogin, mailmanager.getOneMailbox);
    app.get ('/api/searchMailboxes', auth.requiresLogin, mailmanager.searchMailboxes);
};
