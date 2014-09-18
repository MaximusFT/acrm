'use strict';

angular.module('mean.manager').controller('UsersController', ['$scope', 'Global', 'Menus', '$rootScope', '$http', '$log', 'Users',
    function($scope, Global, Menus, $rootScope, $http, $log, Users) {
        $scope.global = Global;
		$scope.mode = window.user.roles.indexOf('admin') > -1 ? 0 : (window.user.roles.indexOf('manager') > -1 ? 1 : (window.user.roles.indexOf('employeer') > -1 ? 2 : (window.user.roles.indexOf('authenticated') > -1 ? 3 : 4)));
        //$log.warn($scope.mode);
		$scope.userSchema = [{
            title: 'Email',
            schemaKey: 'email',
            type: 'text',
            inTable: true
        }, {
            title: 'Name',
            schemaKey: 'name',
            type: 'text',
            inTable: true
        }, {
            title: 'Username',
            schemaKey: 'username',
            type: 'text',
            inTable: true
        }, {
			title : 'Department ID',
			schemaKey : 'department',
			type : 'text',
			inTable : true
		}, {
            title: 'Roles',
            schemaKey: 'roles',
            type: 'select',
            options: window.user.roles.indexOf('admin') > -1 ? ['admin', 'manager', 'employeer', 'authenticated'] : (window.user.roles.indexOf('manager') > -1 ? ['manager', 'employeer', 'authenticated'] : (window.user.roles.indexOf('employeer') ? ['employeer', 'authenticated'] : ['authenticated'])),
            inTable: true
        }, {
            title: 'Password',
            schemaKey: 'password',
            type: 'password',
            inTable: false
        }, {
            title: 'Repeat password',
            schemaKey: 'confirmPassword',
            type: 'password',
            inTable: false
        }];
        $scope.user = {};

        $scope.init = function() {
            Users.query({}, function(users) {
                $scope.users = users;
            });
			
        };

        $scope.add = function() {
            if (!$scope.users) $scope.users = [];

            var user = new Users({
                email: $scope.user.email,
                name: $scope.user.name,
                username: $scope.user.username,
				department: $scope.user.department,
                password: $scope.user.password,
                confirmPassword: $scope.user.confirmPassword,
                roles: $scope.user.roles
            });
			
            user.$save(function(response) {
                $scope.users.push(response);
				$scope.user.email = $scope.user.name = $scope.user.username = $scope.user.department = $scope.user.password = $scope.user.confirmPassword = $scope.user.roles = '';
            });
        };

        $scope.remove = function(user) {
            for (var i in $scope.users) {
                if ($scope.users[i] === user) {
                    $scope.users.splice(i, 1);
                }
            }

            user.$remove();
        };

        $scope.update = function(user, userField) {
			var ret = false;
            if (userField && userField === 'roles' && user.roles.length === 0) {		
                user.roles = user.tmpRoles;
            }
			if (userField && userField === 'roles' && user.roles.length !== 0) {		
				user.roles = user.roles[0] === 'authenticated' ? user.tmpRoles : user.tmpRoles.concat(user.roles);
			}
			if (userField && userField === 'email' && user.email === '') {
				user.email = user.tmpEmail;
				ret = true;
			}
			if (userField && userField === 'name' && user.name === '') {
				user.name = user.tmpName;
				ret = true;
			}
			if (userField && userField === 'username' && user.username === '') {
				user.username = user.tmpUsername;
				ret = true;
			}
			if (userField && userField === 'department' && user.department === '') {
				user.email = user.tmpDepartment;
				ret = true;
			}
			if(!ret) {
				user.$update();
			}
        };

        $scope.beforeSelect = function(userField, user) {
			if(userField === 'email')
				user.tmpEmail = user.email;
			if(userField === 'name')
				user.tmpName = user.name;
			if(userField === 'username')
				user.tmpUsername = user.username;
			if(userField === 'department')
				user.tmpDepartment = user.department;
			if(userField === 'roles')
				user.tmpRoles = ['authenticated'];//user.roles;
        };
    }
]);