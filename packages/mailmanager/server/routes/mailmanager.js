'use strict';

/* jshint -W098 */
// The Package is past automatically as first parameter
module.exports = function(Mailmanager, app, auth, database) {

  var mailmanager = require('../controllers/mailmanager.js');

app.get('/mailmanager/example/render', function(req, res, next) {
    Mailmanager.render('index', {
      package: 'mailmanager'
    }, function(err, html) {
      //Rendering a view from the Package server/views
      res.send(html);
    });
  });

  app.route('/mailboxadd').post(mailmanager.boxFromFront);
  app.get('/synchronizemailboxes',mailmanager.synchronizemailboxes);
    app.get('/getdomlist',mailmanager.getDomainList);
     app.get('/getmailboxes',mailmanager.getmailboxes);
  app.get('/dbfrom',mailmanager.dbfrom);
  app.route('/dbdel').post(mailmanager.dbdel);
};


// module.exports = function(Mailmanager, app, auth, database) {

//   app.get('/mailmanager/example/anyone', function(req, res, next) {
//     res.send('Anyone can access this');
//   });

//   app.get('/mailmanager/example/auth', auth.requiresLogin, function(req, res, next) {
//     res.send('Only authenticated users can access this');
//   });

//   app.get('/mailmanager/example/admin', auth.requiresAdmin, function(req, res, next) {
//     res.send('Only users with Admin role can access this');
//   });

//   app.get('/mailmanager/example/render', function(req, res, next) {
//     Mailmanager.render('index', {
//       package: 'mailmanager'
//     }, function(err, html) {
//       //Rendering a view from the Package server/views
//       res.send(html);
//     });
//   });
// };

