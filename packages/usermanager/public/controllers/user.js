'use strict';

angular.module('mean.usermanager').controller('UserController', ['$scope', 'Global', 'Menus', '$rootScope', '$http', '$log', '$stateParams', 'Users',
    function($scope, Global, Menus, $rootScope, $http, $log, $stateParams, Users) {
        $scope.global = Global;
		$scope.userId = $stateParams.userId;
		$scope.mode = window.user.roles.indexOf('admin') > -1 ? 0 : (window.user.roles.indexOf('manager') > -1 ? 1 : (window.user.roles.indexOf('employeer') > -1 ? 2 : (window.user.roles.indexOf('authenticated') > -1 ? 3 : 4)));
		//$log.info($scope.mode);
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
			title : 'Department',
			schemaKey : 'department',
			type : 'text',
			inTable : true
		}, {
			title: 'Phone',
			schemaKey : 'phone',
			type : 'text',
			inTable : true
		}, {
            title: 'Roles',
            schemaKey: 'roles',
            type: 'select',
            options: window.user.roles.indexOf('admin') > -1 ? ['admin', 'manager', 'employeer', 'authenticated'] : (window.user.roles.indexOf('manager') > -1 ? ['manager', 'employeer', 'authenticated'] : (window.user.roles.indexOf('employeer') > -1 ? ['employeer', 'authenticated'] : ['authenticated'])),
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
		
		$scope.passSchema = [{
				title : 'Group',
				schemaKey : 'group',
				type : 'text',
				inTable : false
			}, {
				title : 'Resource Title',
				schemaKey : 'resourceName',
				type : 'text',
				inTable : true
			}, {
				title : 'Resource URL',
				schemaKey : 'resourceUrl',
				type : 'text',
				inTable : true
			}, {
				title : 'Email',
				schemaKey : 'email',
				type : 'text',
				inTable : true
			}, {
				title : 'Login',
				schemaKey : 'login',
				type : 'text',
				inTable : true
			}, {
				title : 'Password',
				schemaKey : 'hashed_password',
				type : 'text',
				inTable : true
			}, {
				title : 'Comment',
				schemaKey : 'comment',
				type : 'text',
				inTable : true
			}
		];
		$scope.pass = {};

        $scope.init = function () {
        	/*Users.query({}, function(users) {
        	$scope.users = users;
        	});*/
        	$scope.users = [];
        	$http.get('api/getUser', {
        		params : {
        			userId : $stateParams.userId
        		}
        	}).success(function (data) {
        		$scope.users = [data];
        	}).error(function () {
        		$log.error('error');
        	});
        };
		
		$scope.p_init = function () {
        	$scope.groups = [];
        	$http.get('api/getPassesByUser', {
        		params : {
        			userId : $scope.userId
        		}
        	}).success(function (data) {
				//$log.info(data);
        		$scope.groups = data;
        	}).error(function () {
        		$log.error('error');
        	});
        };

        /*$scope.add = function() {
            if (!$scope.users) $scope.users = [];

            var user = new Users({
                email: $scope.user.email,
                name: $scope.user.name,
                username: $scope.user.username,
                password: $scope.user.password,
                confirmPassword: $scope.user.confirmPassword,
                roles: $scope.user.roles
            });

            user.$save(function(response) {
                $scope.users.push(response);
            });

            this.firstName = this.lastName = this.email = this.password = this.role = '';
        };*/

        /*$scope.remove = function(user) {
            for (var i in $scope.users) {
                if ($scope.users[i] === user) {
                    $scope.users.splice(i, 1);
                }
            }

            user.$remove();
        };*/

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
				user.department = user.tmpDepartment;
			}
			//user.$update();
			Users.update({ userId:user._id }, user);
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