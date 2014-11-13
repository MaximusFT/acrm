'use strict';

angular.module('mean.usermanager').controller('UserController', ['$scope', 'Global', 'Menus', '$rootScope', '$http', '$log', '$stateParams', '$cookies', '$location', 'Users1', 'crypter', 'PrPasswords', 'modalService', 'Requests',
		function ($scope, Global, Menus, $rootScope, $http, $log, $stateParams, $cookies, $location, Users1, crypter, PrPasswords, modalService, Requests) {
			$scope.global = Global;
			$scope.userId = $stateParams.userId;
			$scope.mode = $cookies.mode;
			$scope.isPasses = false;
			$scope.isUser = true;
			$scope.permsg = 'You have not access for any password account.';
			$scope.isPassShown = [];
			$scope.isPassShown1 = [];
			$scope.status = [true];
			$scope.isGroupOpened = [];

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
					type : 'password',
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

			$scope.passSchema1 = [{
					title : 'Group',
					schemaKey : 'group',
					type : 'text',
					inTable : false,
					popover : 'Used for subsequent passwords grouping'
				}, /*{
				title : 'Appointment',
				schemaKey : 'implement',
				type : 'text',
				inTable : false,
				popover : 'Type of the password (social network, messenger, etc.)'
				},*/
				{
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
					type : 'password',
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
			$scope.pass = {};

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
				$scope.isPassShown1 = [];
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
				$scope.isPassShown = [];
				if ($scope.global.user.username !== $scope.userId) {
					$scope.permsg = 'You have not access for this view.';
				} else {
					$scope.getHttp2 = $http.get('api/getPrPassesByUser', {
							crypt : true
						}).success(function (data) {
							//$log.info(data);
							$scope.pr_groups = data;
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
						//implement : $scope.prpass.implement,
						resourceName : $scope.prpass.resourceName,
						resourceUrl : $scope.prpass.resourceUrl,
						email : $scope.prpass.email,
						login : $scope.prpass.login,
						hashed_password : crypter.encrypt($scope.prpass.hashed_password, crypter.hash($scope.global.user.username + $scope.global.user._id)),
						comment : $scope.prpass.comment,
						owner : $scope.global.user._id
					});

				prpass.$save(function (response) {
					var ret = false;
					//$log.info('search the same groups');
					angular.forEach($scope.pr_groups, function (group) {
						if (group.group === response.group) {
							//$log.info('found such group');
							ret = true;
							group.passes.splice(group.passes.length, 0, response);
						}
					});
					if (!ret) {
						//$log.info('not found anything. added new group');
						var o = {
							'group' : response.group,
							'passes' : [response]
						};
						$scope.pr_groups.splice($scope.pr_groups.length, 0, o);
					}
				});

				$scope.prpass.group = $scope.prpass.resourceName = $scope.prpass.resourceUrl = $scope.prpass.login = $scope.prpass.email = $scope.prpass.implement = $scope.prpass.hashed_password = $scope.prpass.comment = '';
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
				$scope.isSent = false;
			};

			$scope.showPass = function (group, index) {
				if (!$scope.isPassShown[group])
					$scope.isPassShown[group] = [];
				if (!$scope.isPassShown[group][index]) {
					$scope.pr_groups[group].passes[index].hashed_password = crypter.decrypt($scope.pr_groups[group].passes[index].hashed_password, crypter.hash($scope.global.user.username + $scope.global.user._id));
					$scope.isPassShown[group][index] = true;
				} else {
					$scope.pr_groups[group].passes[index].hashed_password = crypter.encrypt($scope.pr_groups[group].passes[index].hashed_password, crypter.hash($scope.global.user.username + $scope.global.user._id));
					$scope.isPassShown[group][index] = false;
				}
			};
			
			$scope.showPass1 = function (group, implement, index) {
				if (!$scope.isPassShown[group])
					$scope.isPassShown[group] = [];
				if (!$scope.isPassShown[group][implement])
					$scope.isPassShown[group][implement] = [];
				if (!$scope.isPassShown[group][implement][index]) {
					/*$scope.pr_groups[group].passes[index].hashed_password = crypter.decrypt($scope.pr_groups[group].passes[index].hashed_password, crypter.hash($scope.global.user.username + $scope.global.user._id));*/
					$scope.isPassShown[group][implement][index] = true;
				} else {
					/*$scope.pr_groups[group].passes[index].hashed_password = crypter.encrypt($scope.pr_groups[group].passes[index].hashed_password, crypter.hash($scope.global.user.username + $scope.global.user._id));*/
					$scope.isPassShown[group][implement][index] = false;
				}
			};

			$scope.edit = function (gind, pind) {
				if (!$scope.isPassShown[gind])
					$scope.isPassShown[gind] = [];
				$scope.isPassShown[gind][pind] = false;
				var modalOptions = {
					closeButtonText : 'Cancel',
					actionButtonText : 'Confirm',
					headerText : 'Edit password',
					bodyText : 'Fill the fields with new values if you want update your password information.',
					type : 4,
					editprp : $scope.pr_groups[gind].passes[pind]
				};

				modalService.showModal({}, modalOptions).then(function (result) {
					if (result.password) {
						result.hashed_password = crypter.encrypt(result.password, crypter.hash($scope.global.user.username + $scope.global.user._id));
						$scope.pr_groups[gind].passes[pind].hashed_password = result.hashed_password;
					}
					PrPasswords.update({
						passId : result._id
					}, result);

				});
			};

			$scope.remove = function (gind, pind) {
				PrPasswords.remove({
					passId : $scope.pr_groups[gind].passes[pind]._id
				});
				$scope.status.splice($scope.pr_groups[gind].passes.indexOf($scope.pr_groups[gind].passes[pind]), 1);
				$scope.pr_groups[gind].passes.splice($scope.pr_groups[gind].passes.indexOf($scope.pr_groups[gind].passes[pind]), 1);
			};

			$scope.getPass = function (pass) {
				return crypter.decrypt(pass, crypter.hash($scope.global.user.username + $scope.global.user._id));
			};
			
			$scope.getPass1 = function (pass) {
				return pass;
			};

			$scope.sendRequestOnAdd = function () {
				//$scope.pass.hashed_password = crypter.encrypt($scope.pass.hashed_password, crypter.hash($scope.global.user.username + $scope.global.user._id));
				var request = new Requests({
						type : 1,
						info : $scope.pass,
						when : new Date().getTime() / 1000,
						comment : 'User wants to add this password to system'
					});
				request.$save(function (response) {
					if (response)
						$scope.isSent = true;
				});
			};
		}
	]);
