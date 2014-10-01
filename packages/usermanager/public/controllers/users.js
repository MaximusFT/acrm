'use strict';

angular.module('mean.usermanager').controller('UsermanagerController', ['$scope', 'Global', 'Usermanager',
		function ($scope, Global, Usermanager) {
			$scope.global = Global;
			$scope.package = {
				name : 'usermanager'
			};
		}
	]);

angular.module('mean.usermanager').controller('UsersController', ['$scope', '$cookies', 'Global', 'Menus', '$rootScope', '$http', '$log', 'Users',
		function ($scope, $cookies, Global, Menus, $rootScope, $http, $log, Users) {
			$scope.global = Global;
			$scope.mode = $cookies.mode;

			$http.get('api/getDepartments').success(function (data) {
				$scope.departments = data;

				$scope.userSchema = [{
						title : 'Email',
						schemaKey : 'email',
						type : 'text',
						inTable : true
					}, {
						title : 'Name',
						schemaKey : 'name',
						type : 'text',
						inTable : true
					}, {
						title : 'Username',
						schemaKey : 'username',
						type : 'text',
						inTable : true
					}, {
						title : 'Department',
						schemaKey : 'department',
						type : 'select',
						options : $scope.departments,
						inTable : true
					}, {
						title : 'Phone',
						schemaKey : 'phone',
						type : 'text',
						inTable : true
					}, {
						title : 'Roles',
						schemaKey : 'roles',
						type : 'select',
						options : $cookies.mode === 'Administrator' ? ['admin', 'manager', 'employeer', 'authenticated'] : ($cookies.mode === 'Manager' ? ['manager', 'employeer', 'authenticated'] : ($cookies.mode === 'Employeer' ? ['employeer', 'authenticated'] : ['authenticated'])),
						inTable : true
					}, {
						title : 'Password',
						schemaKey : 'password',
						type : 'password',
						inTable : false
					}, {
						title : 'Repeat password',
						schemaKey : 'confirmPassword',
						type : 'password',
						inTable : false
					}
				];
				$scope.user = {};
			}).error(function () {
				$log.error('error');
			});

			$scope.init = function () {
				/*Users.query({}, function(users) {
				$scope.users = users;
				});*/
				$http.get('api/getUsers').success(function (data) {
					$scope.departments = data;
					//$log.info($scope.departments);
				}).error(function () {
					$log.error('error');
				});
			};

			$scope.add = function () {
				if (!$scope.passwords)
					$scope.passwords = [];

				var user = new Users({
						email : $scope.user.email,
						name : $scope.user.name,
						username : $scope.user.username,
						department : $scope.user.department,
						phone : $scope.user.phone,
						password : $scope.user.password,
						confirmPassword : $scope.user.confirmPassword,
						roles : $scope.user.roles
					});

				user.$save(function (response) {
					var ret = false;
					$scope.departments.forEach(function (department) {
						if (department.department === response.department) {
							ret = true;
							department.users.splice(department.users.length, 0, response);
						}
					});
					if (!ret) {
						var u = [response];
						var o = {
							'department' : response.department,
							'users' : u
						};
						$scope.departments.splice($scope.departments.length, 0, o);
						$scope.departments.sort(function (a, b) {
							return a.department > b.department;
						});
					}
				});
			};

			$scope.remove = function (user) {
				$scope.departments.forEach(function (department) {
					department.users.forEach(function (u) {
						if (u === user) {
							department.users.splice(department.users.indexOf(u), 1);
						}
					});
				});
				Users.remove({
					userId : user._id
				});
			};

			$scope.update = function (user, userField) {
				if (userField && userField === 'roles') {
					if (user.roles.indexOf('authenticated') === -1)
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
				//user.$update();
				Users.update({
					userId : user._id
				}, user);
			};

			$scope.beforeSelect = function (userField, user) {
				if (userField === 'email')
					user.tmpEmail = user.email;
				if (userField === 'name')
					user.tmpName = user.name;
				if (userField === 'username')
					user.tmpUsername = user.username;
				if (userField === 'department')
					user.tmpDepartment = user.department;
				if (userField === 'roles')
					user.tmpRoles = ['authenticated']; //user.roles;
			};
		}
	]);
