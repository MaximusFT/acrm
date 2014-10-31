'use strict';

angular.module('mean.usermanager').controller('UsermanagerController', ['$scope', 'Global', 'Usermanager',
		function ($scope, Global, Usermanager) {
			$scope.global = Global;
			$scope.package = {
				name : 'usermanager'
			};
		}
	]);

angular.module('mean.usermanager').controller('UsersController', ['$scope', '$cookies', 'Global', 'Menus', '$rootScope', '$http', '$log', 'Users', 'modalService',
		function ($scope, $cookies, Global, Menus, $rootScope, $http, $log, Users, modalService) {
			$scope.global = Global;
			$scope.mode = $cookies.mode;
			$scope.isSomeSelected = true;
			$scope.isUserSelected = [];
			$scope.getHttp1 = null;
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

			$scope.init = function () {
				/*Users.query({}, function(users) {
				$scope.users = users;
				});*/
				$scope.getHttp1 = $http.get('api/getUsers').success(function (data) {
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
						roles : ['authenticated']
					});

				user.$save(function (response) {
					var ret = false;
					//$log.info('search the same departments');
					angular.forEach($scope.departments, function (department) {
						if (department.department === response.department.name) {
							//$log.info('found such implement. added to it');
							ret = true;
							department.users.splice(department.users.length, 0, response);
						}
					});

					if (!ret) {
						//$log.info('not found anything. added new group');
						var o = {
							'department' : response.department.name,
							'users' : [response]
						};
						$scope.departments.splice($scope.departments.length, 0, o);
						$scope.departments.sort(function (a, b) {
							return a.department > b.department;
						});
					}
					$scope.init();
				});
			};

			$scope.remove = function () {
				var deleted = [];
				angular.forEach($scope.isUserSelected, function (department, did) {
					angular.forEach(department, function (user, uid) {
						if (user === true) {
							Users.remove({
								userId : $scope.departments[did].users[uid]._id
							});
							if (!deleted[did])
								deleted[did] = [];
							deleted[did][uid] = true;
						}
					});
				});
				angular.forEach(deleted, function (department, did) {
					angular.forEach(department, function (user, uid) {
						if (user === true) {
							$scope.departments[did].users.splice($scope.departments[did].users.indexOf($scope.departments[did].users[uid]), 1);
						}
					});
				});
				angular.forEach($scope.departments, function (department) {
					angular.forEach(department.users, function (user) {
						user.Selected = false;
					});
				});
				$scope.isUserSelected = [];
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

			$scope.selectAll = function (sectionIndex) {
				if (!$scope.isUserSelected[sectionIndex]) {
					$scope.isUserSelected[sectionIndex] = [];
				}
				var ret = false;
				// checking is already the selection in section
				angular.forEach($scope.isUserSelected, function (department) {
					angular.forEach(department, function (user) {
						if (user === true)
							ret = true;
					});
				});
				// if selection exists - remove it, doesn't exist – select all
				angular.forEach($scope.departments[sectionIndex].users, function (user, uid) {
					$scope.isUserSelected[sectionIndex][uid] = !ret;
					user.Selected = !ret;
				});
				$scope.isSomeSelected = checkSelections();
			};

			function checkSelections() {
				var ret = false;
				angular.forEach($scope.isUserSelected, function (department) {
					angular.forEach(department, function (user) {
						if (user === true)
							ret = true;
					});
				});
				return !ret;
			}

			$scope.checkUser = function (sectionIndex, index, user) {
				if (!$scope.isUserSelected[sectionIndex])
					$scope.isUserSelected[sectionIndex] = [];
				if (user.Selected === false)
					$scope.isUserSelected[sectionIndex][index] = false;
				if (user.Selected === true)
					$scope.isUserSelected[sectionIndex][index] = true;
				$scope.isSomeSelected = checkSelections();
			};

			$scope.assignRole = function (role) {
				$scope.ttt = false;
				var users = [];
				angular.forEach($scope.isUserSelected, function (department, did) {
					angular.forEach(department, function (user, uid) {
						if (user === true)
							users.splice(users.length, 0, $scope.departments[did].users[uid]._id);
					});
				});
				$http({
					url : '/api/assignRole',
					method : 'POST',
					data : {
						'users' : users,
						'role' : role
					}
				})
				.then(function (response) {
					var r = response.data.substring(1, 2).toUpperCase();
					angular.forEach($scope.departments, function (department) {
						angular.forEach(department.users, function (user) {
							if (user.Selected === true) {
								user.roles = r;
								user.Selected = false;
							}
						});
					});
					$scope.isUserSelected = [];
					$scope.isSomeSelected = true;
				},
					function (response) {
					$log.error('error');
				});
			};

			$scope.bind2dep = function () {
				var modalOptions = {
					closeButtonText : 'Cancel',
					actionButtonText : 'Confirm',
					headerText : 'Choose department',
					bodyText : 'Specify what department you want to bind with user(s).',
					type : 3
				};

				modalService.showModal({}, modalOptions).then(function (result) {
					var users = [];
					angular.forEach($scope.isUserSelected, function (department, did) {
						angular.forEach(department, function (user, uid) {
							if (user === true)
								users.splice(users.length, 0, $scope.departments[did].users[uid]._id);
						});
					});
					$http({
						url : '/api/bindToDep',
						method : 'POST',
						data : {
							'users' : users,
							'dep' : result._id
						}
					})
					.then(function (response) {
						angular.forEach($scope.departments, function (department) {
							angular.forEach(department.users, function (user) {
								if (user.Selected === true) {
									user.Selected = false;
								}
							});
						});
						$scope.init();
						$scope.isUserSelected = [];
						$scope.isSomeSelected = true;
					},
						function (response) {
						$log.error('error');
					});
				});
			};

			$scope.clearAccesses = function () {
				var users = [];
				angular.forEach($scope.isUserSelected, function (department, did) {
					angular.forEach(department, function (user, uid) {
						if (user === true)
							users.splice(users.length, 0, $scope.departments[did].users[uid]._id);
					});
				});
				$http({
					url : '/api/clearAccesses',
					method : 'POST',
					data : {
						'users' : users
					}
				})
				.then(function (response) {
					//$log.info(response);
					angular.forEach($scope.departments, function (department) {
						angular.forEach(department.users, function (user) {
							if (user.Selected === true) {
								user.Selected = false;
							}
						});
					});
					$scope.isUserSelected = [];
					$scope.isSomeSelected = true;
				},
					function (response) {
					$log.error('error');
				});
			};
		}
	]);
