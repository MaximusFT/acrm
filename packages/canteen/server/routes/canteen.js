'use strict';

/* jshint -W098 */
// The Package is past automatically as first parameter
module.exports = function(Canteen, app, auth, database) {
    var canteen = require('../controllers/canteen');

    app.get('/api/canteen/userData', auth.requiresLogin, canteen.userData);
};
