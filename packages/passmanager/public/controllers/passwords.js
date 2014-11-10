'use strict';

angular.module('mean.passmanager').controller('PassmanagerController', ['$scope', 'Global', 'Passmanager',
		function ($scope, Global, Passmanager) {
			$scope.global = Global;
			$scope.package = {
				name : 'passmanager'
			};
		}
	]);

angular.module('mean.passmanager').controller('PasswordsController', ['$scope', 'Global', 'Menus', '$rootScope', '$http', '$log', '$cookies', '$q', 'modalService', 'Passwords', 'Users', 'Requests',
		function ($scope, Global, Menus, $rootScope, $http, $log, $cookies, $q, modalService, Passwords, Users, Requests) {
			$scope.mode = $cookies.mode;
			$scope.global = Global;
			$scope.isSomeSelected = true;
			$scope.isPassSelected = [];
			$scope.isRequests = false;
			$scope.isPasses = false;
			$scope.getHttp1 = null;
			$scope.getHttp2 = null;
			$scope.alerts = [{
					type : 'danger',
					msg : 'Attention! Now, being authorized as a department manager, you have access to the passwords, which are assigned to at least one of your employee. If you take away access to the employee and it was the only employee of the department who had access to the password, the password will disappear from this list.'
				}
			];
			$scope.tabs = [{
					type : 0,
					title : 'Requests for access',
					icon : 'glyphicon glyphicon-cog',
					btn : ['Provide access', 'Reject']
				}, {
					type : 1,
					title : 'Request for adding',
					icon : 'glyphicon glyphicon-plus',
					btn : ['Add', 'Remove']
				}, {
					type : 2,
					title : 'Request for editing',
					icon : 'glyphicon glyphicon-pencil',
					btn : ['Confirm', 'Reject']
				}
			];
			if ($scope.mode === 'Administrator') {
				$scope.btn_class = [];
			} else {
				$scope.btn_class = new Array([]);
			}
			Users.query({}, function (users) {
				var lols = [];
				users.forEach(function (item) {
					//$log.info(item);
					lols.push(item.username);
				});
				$scope.passSchema = [{
						title : 'Group',
						schemaKey : 'group',
						type : 'text',
						inTable : false
					}, {
						title : 'Appointment',
						schemaKey : 'implement',
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
						title : 'Username',
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
						inTable : false
					}
				];
				$scope.pass = {};
			});

			$scope.init = function () {
				$scope.getHttp1 = null;
				$scope.groups = [];
				$scope.getHttp1 = $http.get('api/getGroups').success(function (data) {
						$scope.groups = data;
						//$log.info($scope.groups);
					}).error(function () {
						$log.error('error');
					});
			};

			$scope.init_ = function () {
				$scope.getHttp2 = null;
				$scope.groups = [];
				$scope.getHttp2 = $http.get('api/getAcsGroups').success(function (data) {
						$scope.groups = data;
						if (data.length > 0)
							$scope.isPasses = true;
						//$log.warn($scope.groups);
					}).error(function () {
						$log.error('error');
					});
			};

			$scope.init__ = function (t) {
				$scope.getHttp2 = null;
				$scope.requests = [];
				$scope.getHttp2 = $http.get('api/requests', {
						params : {
							type : t
						}
					}).success(function (data) {
						//$log.warn(data);
						angular.forEach(data, function (value, key) {
							var date = new Date(value.when * 1000);
							value.when = date.toLocaleString();
						});
						$scope.requests = data;
						if (data.length > 0)
							$scope.isRequests = true;
						else
							$scope.isRequests = false;
					}).error(function () {
						$log.error('error');
					});
			};

			$scope.sendRequest = function (sectionIndex, id, passId) {
				var modalOptions = {
					closeButtonText : 'Cancel',
					actionButtonText : 'Confirm',
					headerText : 'Request reason',
					bodyText : 'Specify the reason of your request, please.'
				};

				modalService.showModal({}, modalOptions).then(function (result) {
					//$log.info(result);
					var request = new Requests({
							type : 0,
							what : passId,
							when : new Date().getTime() / 1000,
							comment : result
						});
					request.$save(function (response) {
						//$log.info(response);
						if (!$scope.btn_class[sectionIndex])
							$scope.btn_class[sectionIndex] = [];
						$scope.btn_class[sectionIndex][id] = 'btn btn-success';
					});
				});
			};

			$scope.provideAccess = function (id, type) {
				var rId = $scope.requests[id]._id;
				$http({
					url : '/api/confirmReq',
					method : 'POST',
					data : {
						'reqId' : rId,
						'type' : type
					}
				})
				.then(function (response) {
					//$log.info(response);
					$scope.btn_class[id] = 'btn btn-success';
				},
					function (response) {
					$log.error('error');
				});
			};

			$scope.rejectAccess = function (id, type) {
				var rId = $scope.requests[id]._id;
				$http({
					url : '/api/rejectReq',
					method : 'POST',
					data : {
						'reqId' : rId
						//'type' : type
					}
				})
				.then(function (response) {
					//$log.info(response);
					$scope.btn_class[id] = 'btn btn-info';
				},
					function (response) {
					$log.error('error');
				});
			};

			$scope.assignToPerson = function () {
				var modalOptions = {
					closeButtonText : 'Cancel',
					actionButtonText : 'Confirm',
					headerText : 'Choose person(s)',
					bodyText : 'Specify what employee you want to grant access.',
					type : 1
				};

				modalService.showModal({}, modalOptions).then(function (result) {
					var passes = [];
					angular.forEach($scope.isPassSelected, function (group, gind) {
						angular.forEach(group, function (implement, impind) {
							angular.forEach(implement, function (pass, pind) {
								if (pass === true)
									passes.splice(passes.length, 0, $scope.groups[gind].implement[impind].passes[pind]._id);
							});
						});
					});
					$http({
						url : '/api/provideAccess',
						method : 'POST',
						data : {
							'users' : result,
							'passes' : passes
						}
					})
					.then(function (response) {
						unselectAll();
					},
						function (response) {
						$log.error('error');
					});
				});
			};

			$scope.assignToDepartment = function () {
				var modalOptions = {
					closeButtonText : 'Cancel',
					actionButtonText : 'Confirm',
					headerText : 'Choose department',
					bodyText : 'Specify what department you want to grant access.',
					type : 2
				};

				modalService.showModal({}, modalOptions).then(function (result) {
					var passes = [];
					angular.forEach($scope.isPassSelected, function (group, gind) {
						angular.forEach(group, function (implement, impind) {
							angular.forEach(implement, function (pass, pind) {
								if (pass === true)
									passes.splice(passes.length, 0, $scope.groups[gind].implement[impind].passes[pind]._id);
							});
						});
					});
					$http({
						url : '/api/provideAccess',
						method : 'POST',
						data : {
							'deps' : result,
							'passes' : passes
						}
					})
					.then(function (response) {
						unselectAll();
					},
						function (response) {
						$log.error('error');
					});
				});
			};

			$scope.revoke = function () {
				var modalOptions = {
					closeButtonText : 'Cancel',
					actionButtonText : 'Confirm',
					headerText : 'Choose person(s)',
					bodyText : 'Specify what employee you want to revoke access.',
					type : 1
				};

				modalService.showModal({}, modalOptions).then(function (result) {
					var passes = [];
					angular.forEach($scope.isPassSelected, function (group, gind) {
						angular.forEach(group, function (implement, impind) {
							angular.forEach(implement, function (pass, pind) {
								if (pass === true)
									passes.splice(passes.length, 0, $scope.groups[gind].implement[impind].passes[pind]._id);
							});
						});
					});
					$http({
						url : '/api/revokeAccess',
						method : 'POST',
						data : {
							'users' : result,
							'passes' : passes
						}
					})
					.success(function (response) {
						//$log.info('success');
						unselectAll();
					})
					.error(function (response) {
						$log.error('error');
					});
				});
			};

			$scope.selectAll = function (sectionIndex, implementIndex) {
				if (!$scope.isPassSelected[sectionIndex]) {
					$scope.isPassSelected[sectionIndex] = [];
				}
				if (!$scope.isPassSelected[sectionIndex][implementIndex]) {
					$scope.isPassSelected[sectionIndex][implementIndex] = [];
				}
				var ret = false;
				// checking is already the selection in section
				angular.forEach($scope.isPassSelected[sectionIndex], function (impl) {
					angular.forEach($scope.isPassSelected[sectionIndex][implementIndex], function (pass) {
						if (pass === true) {
							ret = true;
						}
					});
				});
				// if selection exists - remove it, doesn't exist – select all
				angular.forEach($scope.groups[sectionIndex].implement[implementIndex].passes, function (pass, pid) {
					$scope.isPassSelected[sectionIndex][implementIndex][pid] = !ret;
					pass.Selected = !ret;
				});
				$scope.isSomeSelected = checkSelections();
			};

			function checkSelections() {
				var ret = false;
				angular.forEach($scope.isPassSelected, function (group) {
					angular.forEach(group, function (impl) {
						angular.forEach(impl, function (pass) {
							if (pass === true)
								ret = true;
						});
					});
				});
				return !ret;
			}

			function unselectAll() {
				angular.forEach($scope.groups, function (group) {
					angular.forEach(group.implement, function (implement) {
						angular.forEach(implement.passes, function (pass) {
							if (pass.Selected === true) {
								pass.Selected = false;
							}
						});
					});
				});
				$scope.isPassSelected = [];
				$scope.isSomeSelected = true;
			}

			$scope.checkPass = function (sectionIndex, implementIndex, index, pass) {
				if (!$scope.isPassSelected[sectionIndex])
					$scope.isPassSelected[sectionIndex] = [];
				if (!$scope.isPassSelected[sectionIndex][implementIndex])
					$scope.isPassSelected[sectionIndex][implementIndex] = [];
				if (pass.Selected === false)
					$scope.isPassSelected[sectionIndex][implementIndex][index] = false;
				if (pass.Selected === true)
					$scope.isPassSelected[sectionIndex][implementIndex][index] = true;
				$scope.isSomeSelected = checkSelections();
			};

			$scope.add = function () {
				if (!$scope.passwords)
					$scope.passwords = [];

				var pass = new Passwords({
						group : $scope.pass.group,
						implement : $scope.pass.implement,
						resourceName : $scope.pass.resourceName,
						resourceUrl : $scope.pass.resourceUrl,
						email : $scope.pass.email,
						login : $scope.pass.login,
						password : $scope.pass.hashed_password,
						comment : $scope.pass.comment,
						accessedFor : $scope.pass.accessedFor
					});

				pass.$save(function (response) {
					var ret = false;
					//$log.info('search the same implements');
					angular.forEach($scope.groups, function (group) {
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
						angular.forEach($scope.groups, function (group) {
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
							$scope.groups.splice($scope.groups.length, 0, o);
							$scope.groups.sort(function (a, b) {
								return a.group > b.group;
							});
						}
					}
				});

				//$scope.pass.group = $scope.pass.resourceName = $scope.pass.resourceUrl = $scope.pass.login = $scope.pass.hashed_password = $scope.pass.comment = $scope.pass.accessedFor = '';
			};

			$scope.remove = function () {
				var deleted = [];
				angular.forEach($scope.isPassSelected, function (group, gid) {
					angular.forEach(group, function (implement, impid) {
						angular.forEach(implement, function (pass, pid) {
							if (pass === true) {
								Passwords.remove({
									passId : $scope.groups[gid].implement[impid].passes[pid]._id
								});
								if (!deleted[gid])
									deleted[gid] = [];
								if (!deleted[gid][impid])
									deleted[gid][impid] = [];
								deleted[gid][impid][pid] = true;
							}
						});
					});
				});
				angular.forEach(deleted, function (group, gid) {
					angular.forEach(group, function (implement, impid) {
						angular.forEach(implement, function (pass, pid) {
							if (pass === true) {
								$scope.groups[gid].implement[impid].passes.splice($scope.groups[gid].implement[impid].passes.indexOf($scope.groups[gid].implement[impid].passes[pid]), 1);
							}
						});
					});
				});
				angular.forEach($scope.groups, function (group) {
					angular.forEach(group.implement, function (impl) {
						angular.forEach(impl.passes, function (pass) {
							pass.Selected = false;
						});
					});
				});
				$scope.isPassSelected = [];
				$scope.isSomeSelected = checkSelections();
			};

			$scope.update = function (pass, passField) {
				Passwords.update({
					passId : pass._id
				}, {
					key : passField,
					val : pass[passField]
				});
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
