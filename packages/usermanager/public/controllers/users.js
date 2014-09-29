'use strict';

angular.module('mean.usermanager').controller('UsermanagerController', ['$scope', 'Global', 'Usermanager',
  function($scope, Global, Usermanager) {
    $scope.global = Global;
    $scope.package = {
      name: 'usermanager'
    };
  }
]);


angular.module('mean.usermanager').controller('UsersController', ['$scope', '$cookies', 'Global', 'Menus', '$rootScope', '$http', '$log', 'Users',
    function($scope, $cookies, Global, Menus, $rootScope, $http, $log, Users) {
        $scope.global = Global;
		$scope.mode = $cookies.mode;

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
            options: $cookies.mode === 'Administrator' ? ['admin', 'manager', 'employeer', 'authenticated'] : ($cookies.mode === 'Manager' ? ['manager', 'employeer', 'authenticated'] : ($cookies.mode === 'Employeer' ? ['employeer', 'authenticated'] : ['authenticated'])),
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
				//$log.info(users);
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
			if (userField && userField === 'roles') {		
				if(user.roles.indexOf('authenticated') === -1)
					user.roles.unshift('authenticated');
			}
			if (userField && userField === 'email' && user.email === '') {				
				user.email = user.tmpEmail;
			}
			if (userField && userField === 'name' && user.name === '') {
				user.name = user.tmpName;
			}
			if (userField && userField === 'username' && user.username === '') {
				user.username = user.tmpUsername;
			}
			if (userField && userField === 'department' && user.department === '') {
				user.email = user.tmpDepartment;
			}
			user.$update();
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