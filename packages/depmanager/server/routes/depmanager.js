'use strict';

// The Package is past automatically as first parameter
module.exports = function(Depmanager, app, auth, database) {

    var departments = require('../controllers/departments'),
        users = require('../controllers/users');

    app.get('/api/departments', auth.requiresLogin, departments.all);
    app.get('/api/department/:departmentId', auth.requiresLogin, departments.department);
    app.get('/api/departmentsTree', auth.requiresManager, departments.departmentsTree);
    app.post('/api/departments', auth.requiresLogin, departments.create);
    app.put('/api/departments/:departmentId', auth.requiresManager, departments.update);
    app.delete('/api/departments/:departmentId', auth.requiresManager, departments.destroy);
    app.post('/api/addNewDepartmentBranch', auth.requiresManager, departments.addNewDepartmentBranch);
    app.get('/api/getDeps', auth.requiresLogin, departments.getDeps);
    app.get('/api/getNewDeps', auth.requiresLogin, departments.getNewDeps);
    app.post('/api/changeParent', auth.requiresManager, departments.changeParent);

    app.get('/api/department/users/:department', auth.requiresLogin, users.usersByDepartment);
    app.post('/api/bindToDep', auth.requiresManager, users.bindToDep, auth.eventHandler);
    app.get('/api/allUsersByDeps', auth.requiresManager, users.allUsersByDeps);
};
