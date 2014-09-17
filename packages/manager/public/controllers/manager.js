'use strict';

angular.module('mean.manager').controller('ManagerController', ['$scope', 'Global', 'Manager',
		function ($scope, Global, Manager) {
			$scope.global = Global;
			$scope.package = {
				name : 'manager'
			};
		}
	]);

angular.module('mean.manager').controller('AllController', ['$scope', 'Global', 'Menus', '$rootScope', '$http', '$log', 'Users', 'Passwords',
		function ($scope, Global, Menus, $rootScope, $http, $log, Users, Passwords) {
			$scope.global = Global;
			$scope.mode = window.user.roles.indexOf('admin') > -1 ? 0 : (window.user.roles.indexOf('manager') > -1 ? 1 : (window.user.roles.indexOf('employeer') > -1 ? 2 : (window.user.roles.indexOf('authenticated') > -1 ? 3 : 4)));
			
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
					title : 'Department ID',
					schemaKey : 'department',
					type : 'text',
					inTable : true
				}, {
					title : 'Roles',
					schemaKey : 'roles',
					type : 'select',
					options : ['admin', 'manager', 'employeer', 'authenticated'],
					inTable : false
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

			$scope.initusers = function () {
				if($scope.mode === 0) {
					Users.query({}, function (users) {
						$scope.users = users;
					});
				} else if ($scope.mode === 1) {
					$http.get('api/user', {
						params : {
							userId : window.user._id
						}
					}).success(function (data) {
						$scope.curUser = data;
						$http.get('api/fromDepartment', {
							params : {
								department : $scope.curUser.department
							}
						}).success(function (data) {
							$scope.users = data;
						}).error(function () {
							$log.error('error');
						});
					}).error(function () {
						$log.error('error');
					});
				} else if ($scope.mode === 2) {
					$http.get('api/user', {
						params : {
							userId : window.user._id
						}
					}).success(function (data) {
						$scope.users = data;
					}).error(function () {
						$log.error('error');
					});
				}
			};

			$scope.adduser = function () {
				if (!$scope.users)
					$scope.users = [];

				var user = new Users({
						email : $scope.user.email,
						name : $scope.user.name,
						username : $scope.user.username,
						password : $scope.user.password,
						confirmPassword : $scope.user.confirmPassword,
						roles : $scope.user.roles
					});

				user.$save(function (response) {
					$scope.users.push(response);
				});

				this.firstName = this.lastName = this.email = this.password = this.role = '';
			};

			$scope.removeuser = function (user) {
				for (var i in $scope.users) {
					if ($scope.users[i] === user) {
						$scope.users.splice(i, 1);
					}
				}

				user.$remove();
			};

			$scope.updateuser = function (user, userField) {
				/*if (userField && userField === 'roles' && user.roles.indexOf('admin') === -1) {
					if (confirm('Are you sure you want to remove "admin" role?')) {
						user.$update();
					} else {
						user.roles = user.tmpRoles;
					}
				} else*/
					user.$update();
			};

			$scope.beforeSelect = function (userField, user) {
				if (userField === 'roles') {
					user.tmpRoles = user.roles;
				}
			};

			Users.query({}, function (users) {
				var lols = [];
				users.forEach(function (item) {
					//$log.info(item);
					lols.push(item.username);
				});
				$scope.passSchema = [{
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
						title : 'Username',
						schemaKey : 'login',
						type : 'text',
						inTable : true
					}, {
						title : 'Password',
						schemaKey : 'password',
						type : 'password',
						inTable : false
					}, {
						title : 'Comment',
						schemaKey : 'comment',
						type : 'text',
						inTable : true
					}, {
						title : 'Users with access',
						schemaKey : 'accessedFor',
						type : 'select',
						//options: ['none', 'me'],
						options : lols,
						inTable : false
					}
				];
				$scope.pass = {};
			});

			$scope.initpasses = function () {
				Passwords.query({}, function (passwords) {
					$scope.passwords = passwords;
				});
			};

			$scope.addpass = function () {
				if (!$scope.passwords)
					$scope.passwords = [];

				var pass = new Passwords({
						resourceName : $scope.pass.resourceName,
						resourceUrl : $scope.pass.resourceUrl,
						login : $scope.pass.login,
						password : $scope.pass.password,
						comment : $scope.pass.comment,
						accessedFor : $scope.pass.accessedFor
					});

				pass.$save(function (response) {
					$scope.passwords.push(response);
				});

				//this.firstName = this.lastName = this.email = this.password = this.role = '';
			};

			$scope.removepass = function (pass) {
				for (var i in $scope.passwords) {
					if ($scope.passwords[i] === pass) {
						$scope.passwords.splice(i, 1);
					}
				}

				pass.$remove();
			};

			$scope.updatepass = function (pass, passField) {
				pass.$update();
			};

		}
	]);
