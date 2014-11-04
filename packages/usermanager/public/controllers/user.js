'use strict';

angular.module('mean.usermanager').controller('UserController', ['$scope', 'Global', 'Menus', '$rootScope', '$http', '$log', '$stateParams', '$cookies', '$location', 'Users1', 'PrPasswords',
		function ($scope, Global, Menus, $rootScope, $http, $log, $stateParams, $cookies, $location, Users1, PrPasswords) {
			$scope.global = Global;
			$scope.userId = $stateParams.userId;
			$scope.mode = $cookies.mode;
			$scope.isPasses = false;
			$scope.isUser = true;
			$scope.permsg = 'You have not access for any password account.';

			$scope.alerts = [{
					type : 'info',
					msg : 'The system provides the ability to store private passwords. These are the passwords that are not related to corporate, but you often use them. They are protected from other users, administrators, etc. Enjoy using the system.'
				}
			];

			$http.get('users/me').success(function (data) {
				//$log.info(data);
				if (data.username === $scope.userId)
					$scope.me = true;
			}).error(function (data, status) {
				$log.error(data);
			});

			$http.get('api/getDepartments').success(function (data) {
				//$log.info(data);
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
						type : 'text',
						inTable : true
					}, {
						title : 'Phone',
						schemaKey : 'phone',
						type : 'text',
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

			$scope.passSchema = [{
					title : 'Group',
					schemaKey : 'group',
					type : 'text',
					inTable : false,
					popover : 'Used for subsequent passwords grouping'
				}, {
					title : 'Appointment',
					schemaKey : 'implement',
					type : 'text',
					inTable : false,
					popover : 'Type of the password (social network, messenger, etc.)'
				}, {
					title : 'Resource Title',
					schemaKey : 'resourceName',
					type : 'text',
					inTable : true,
					popover : 'For example, \'Inside\''
				}, {
					title : 'Resource URL',
					schemaKey : 'resourceUrl',
					type : 'text',
					inTable : true,
					popover : 'Access link: http://...'
				}, {
					title : 'Email',
					schemaKey : 'email',
					type : 'text',
					inTable : true,
					popover : 'Email for accessing if necessary'
				}, {
					title : 'Login',
					schemaKey : 'login',
					type : 'text',
					inTable : true,
					popover : 'Username for accessing'
				}, {
					title : 'Password',
					schemaKey : 'hashed_password',
					type : 'text',
					inTable : true,
					popover : 'Service password'
				}, {
					title : 'Comment',
					schemaKey : 'comment',
					type : 'text',
					inTable : true,
					popover : 'You can specify a comment if required.'
				}
			];
			$scope.prpass = {};

			$scope.init = function () {
				/*Users.query({}, function(users) {
				$scope.users = users;
				});*/
				$scope.users = [];
				$scope.getHttp1 = $http.get('api/getUser', {
						params : {
							userId : $stateParams.userId
						}
					}).success(function (data) {
						//$log.info(data);
						if (data !== 'null') {
							data.department = data.department.name;
							$scope.users = [data];
						} else
							$scope.isUser = false;
						//$log.info($scope.users);
					}).error(function (data, status) {
						if (status === 500)
							$location.path('manager/users');
					});
			};

			$scope.p_init = function () {
				$scope.groups = [];
				if ($scope.global.mode === 'Employee' && $scope.global.user.username !== $scope.userId) {
					$scope.permsg = 'You have not access for this view.';
				} else {
					$scope.getHttp2 = $http.get('api/getPassesByUser', {
							params : {
								userId : $scope.userId
							}
						}).success(function (data) {
							//$log.info(data);
							$scope.groups = data;
							if (data.length > 0)
								$scope.isPasses = true;
						}).error(function (data, status) {
							if (status === 500) {
								$scope.permsg = 'You have not access for this view.';
								//$location.path('manager/users');
							}
						});
				}
			};

			$scope.pp_init = function () {
				$scope.pr_groups = [];
				if ($scope.global.user.username !== $scope.userId) {
					$scope.permsg = 'You have not access for this view.';
				} else {
					$scope.getHttp2 = $http.get('api/getPrPassesByUser',
					{crypt:true}).success(function (data) {
							//$log.info(data);
							$scope.pr_groups = data;
							//$crypto.decrypt(encrypted)
							if (data.length > 0)
								$scope.isPrPasses = true;
						}).error(function (data, status) {
							if (status === 500) {
								$scope.permsg = 'You have not access for this view.';
								//$location.path('manager/users');
							}
						});
				}
			};

			$scope.pp_add = function () {			
				var prpass = new PrPasswords({
						group : $scope.prpass.group,
						implement : $scope.prpass.implement,
						resourceName : $scope.prpass.resourceName,
						resourceUrl : $scope.prpass.resourceUrl,
						email : $scope.prpass.email,
						login : $scope.prpass.login,
						password : $scope.prpass.hashed_password,
						comment : $scope.prpass.comment,
						owner : $scope.global.user._id
					});

				prpass.$save(function (response) {
					var ret = false;
					//$log.info('search the same implements');
					angular.forEach($scope.pr_groups, function (group) {
						angular.forEach(group.implement, function (implement) {
							if (implement.implement === response.implement && group.group === response.group) {
								//$log.info('found such implement. added to it');
								ret = true;
								implement.passes.splice(implement.passes.length, 0, response);
							}
						});
					});
					if (!ret) {
						//$log.info('search the same groups');
						angular.forEach($scope.pr_groups, function (group) {
							if (group.group === response.group) {
								//$log.info('found such group');
								ret = true;
								var o = {
									'implement' : response.implement,
									'passes' : [response]
								};
								group.implement.splice(group.implement.length, 0, o);
							}
						});
						if (!ret) {
							//$log.info('not found anything. added new group');
							var o = {
								'group' : response.group,
								'implement' : [{
										'implement' : response.implement,
										'passes' : [response]
									}
								]
							};
							$scope.pr_groups.splice($scope.pr_groups.length, 0, o);
							$scope.pr_groups.sort(function (a, b) {
								return a.group > b.group;
							});
						}
					}
				});

				$scope.prpass.group = $scope.prpass.resourceName = $scope.prpass.resourceUrl = $scope.prpass.login = $scope.prpass.hashed_password = $scope.prpass.comment = $scope.prpass.accessedFor = '';
			};

			$scope.update = function (user, userField) {
				Users1.update({
					userId : user._id
				}, {
					key : userField,
					val : user[userField]
				});
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

			$scope.getSumLength = function (arr) {
				var length = 0;
				angular.forEach(arr, function (item, ind) {
					angular.forEach(item.passes, function (item2, ind2) {
						length += 1;
					});
				});
				return length;
			};

			$scope.closeAlert = function (index) {
				$scope.alerts.splice(index, 1);
			};
		}
	]);
