'use strict';

var request = require('request');
	// _ = require('lodash');

exports.sendInstructions = function(req, res) {
	if(!req.body.user)
		return res.status(400).send('Bad request');
    request.post({
        url: 'http://mapqo.com/temporaryApi/sendpulse/mailSender.php',
        form: {
            name: req.body.user.name,
            surname: req.body.user.surname ? req.body.user.surname : '',
            mail: req.body.user.email,
            secret: '26f329S6Z436MRFthpfv09jw'
        }
    }, function(error, resp, body) {
        if (error && resp.statusCode !== 200) {
        	console.log(resp.statusCode);
        	return res.status(resp.statusCode).send(error);
        } else {
            console.log('result', body);      
            return res.jsonp(body.trim());      
        }
    });
};
