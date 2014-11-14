'use strict';

// The Package is past automatically as first parameter
module.exports = function(Support, app, auth, database) {

  var tickets = require('../controllers/tickets');
	app.post('/api/tickets', auth.requiresLogin, tickets.create);
	app.get('/api/tickets', auth.requiresAdmin, tickets.all);
	app.post('/api/replyTicket', auth.requiresLogin, tickets.reply);
	app.get('/api/myOpenedTickets', auth.requiresLogin, tickets.myOpenedTickets);
	app.get('/api/refreshTicket', auth.requiresLogin, tickets.refreshTicket);
	app.put('/api/closeTicket', auth.requiresAdmin, tickets.closeTicket);
	//app.post('/api/rejectReq', auth.requiresAdmin, requests.rejectRequest);
};
