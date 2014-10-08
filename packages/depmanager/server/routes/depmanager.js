'use strict';

// The Package is past automatically as first parameter
module.exports = function(Depmanager, app, auth, database) {

 var departments = require('../controllers/departments');
    app.get('/api/departments', auth.requiresLogin, departments.all);
	app.get('/api/getDepartment', auth.requiresLogin, departments.getDepartment);
    app.post('/api/departments', auth.requiresLogin, departments.create);
    app.put('/api/departments/:departmentId', auth.requiresLogin, departments.update);
    app.delete('/api/departments/:departmentId', auth.requiresLogin, departments.destroy);
	//app.get('/api/getGroups', auth.requiresLogin, departments.groups);
	//app.get('/api/getPassesByGroup', auth.requiresLogin, departments.passesByGroup);
	//app.delete('/api/deletePass', auth.requiresLogin, departments.delPass);
};
