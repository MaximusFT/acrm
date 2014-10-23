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
			if($scope.mode === 'Administrator') {
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
						title : 'Implement',
						schemaKey : 'implement',
						type : 'text',
						inTable : true,
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
					}/*, {
						title : 'Users with access',
						schemaKey : 'accessedFor',
						type : 'select',
						//options: ['none', 'me'],
						options : lols,
						inTable : true
					}*/
				];
				$scope.pass = {};
			});

			$scope.init = function () {
				$scope.groups = [];
				$http.get('api/getGroups').success(function (data) {
					$scope.groups = data;
					//$log.info($scope.groups);
				}).error(function () {
					$log.error('error');
				});
				/*Passwords.query({}, function (passwords) {
				$scope.passwords = passwords;
				});*/

			};

			$scope.init_ = function () {
				$scope.groups = [];
				$http.get('api/getAcsGroups').success(function (data) {
					$scope.groups = data;
					//$log.warn($scope.groups);
				}).error(function () {
					$log.error('error');
				});
			};
			
			$scope.init__ = function () {
				$scope.requests = [];
				$http.get('api/requests').success(function (data) {
					//$log.warn(data);
					angular.forEach(data, function(value, key) {						
						var date = new Date(value.when*1000);
						value.when = date.toLocaleString();
					});
					$scope.requests = data;
					if (data.length > 0)
						$scope.isRequests = true;
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
					var request = new Requests({
						//who : window.user._id,
						what : passId,
						when : new Date().getTime()/1000,
						comment : result
					});
					request.$save(function(response) {
						//$log.info(response);
						if (!$scope.btn_class[sectionIndex])
							$scope.btn_class[sectionIndex] = [];
						$scope.btn_class[sectionIndex][id] = 'btn btn-success';
					});
				});
			};
			
			$scope.provideAccess = function(id) {
				var rId = $scope.requests[id]._id;
				$http.get('/api/provideAccess', {
					params : {
						reqId: rId
					}
				}).success(function (data) {
					$log.info(data);
					$scope.btn_class[id] = 'btn btn-success';
				}).error(function (data, status) {
					if (status === 500)
						$log.error('error :(');
				});
			};
			
			$scope.rejectAccess = function(id) {
				var rId = $scope.requests[id]._id;
				$http.get('/api/rejectRequest', {
					params : {
						reqId: rId
					}
				}).success(function (data) {
					$log.info(data);
					$scope.btn_class[id] = 'btn btn-info';
				}).error(function (data, status) {
					if (status === 500)
						$log.error('error :(');
				});
			};
			
			$scope.assignToPerson = function() {
				var modalOptions = {
					closeButtonText : 'Cancel',
					actionButtonText : 'Confirm',
					headerText : 'Choose person(s)',
					bodyText : 'Specify what employee you want to grant access.',
					type : 1
				};

				modalService.showModal({}, modalOptions).then(function (result) {
					var passes = [];
					angular.forEach($scope.isPassSelected, function(group, gind) {
						angular.forEach(group, function(pass, pind) {
							if(pass === true)
								passes.splice(passes.length, 0, $scope.groups[gind].passes[pind]._id);
						});
					});
					$http({
						url: '/api/provideAccess',
						method: 'POST',
						data: { 
							'users' : result,
							'passes' : passes
						}
					})
					.then(function(response) {
						
					}, 
					function(response) {
						$log.error('error');
					});
				});
			};
			
			$scope.assignToDepartment = function() {
				var modalOptions = {
					closeButtonText : 'Cancel',
					actionButtonText : 'Confirm',
					headerText : 'Choose department',
					bodyText : 'Specify what department you want to grant access.',
					type : 2
				};

				modalService.showModal({}, modalOptions).then(function (result) {			
					$log.info(result);
				});
			};
			
			$scope.revoke = function() {
				var modalOptions = {
					closeButtonText : 'Cancel',
					actionButtonText : 'Confirm',
					headerText : 'Choose person(s)',
					bodyText : 'Specify what employee you want to revoke access.',
					type : 1
				};

				modalService.showModal({}, modalOptions).then(function (result) {
					var passes = [];
					angular.forEach($scope.isPassSelected, function(group, gind) {
						angular.forEach(group, function(pass, pind) {
							if(pass === true)
								passes.splice(passes.length, 0, $scope.groups[gind].passes[pind]._id);
						});
					});
					$http({
						url: '/api/revokeAccess',
						method: 'POST',
						data: { 
							'users' : result,
							'passes' : passes
						}
					})
					.success(function(response) {
						$log.info('success');
					})
					.error(function(response) {
						$log.error('error');
					});
				});
			};
			
			$scope.selectAll = function(sectionIndex) {		
				if(!$scope.isPassSelected[sectionIndex]) {
					$scope.isPassSelected[sectionIndex] = [];				
				}
				var ret = false;
				// checking is already the selection in section
				angular.forEach($scope.isPassSelected[sectionIndex], function(pass) {
					if(pass === true) {
						ret = true;
					}
				});
				// if selection exists - remove it, doesn't exist – select all
				angular.forEach($scope.groups[sectionIndex].passes, function (item, index) {				
					$scope.isPassSelected[sectionIndex][index] = !ret;
					item.Selected = !ret;
				});			
				$scope.isSomeSelected = checkSelections();
			};
			
			function checkSelections() {		
				var ret = false;
				angular.forEach($scope.isPassSelected, function(group) {
					angular.forEach(group, function(pass) {
						if(pass === true)
							ret = true;
					});
				});			
				return !ret;
			}
			
			$scope.checkPass = function(sectionIndex, index, pass) {				
				if(!pass.Selected) {
					if(!$scope.isPassSelected[sectionIndex])
						$scope.isPassSelected[sectionIndex] = [];
					$scope.isPassSelected[sectionIndex][index] = true;
				} else {
					$scope.isPassSelected[sectionIndex][index] = false;
				}
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
					//$scope.passwords.push(response);
					var ret = false;
					$scope.groups.forEach(function (group) {
						if (group.group === response.group) {
							ret = true;
							group.passes.splice(group.passes.length, 0, response);
						}
					});
					if (!ret) {
						var p = [response];
						var o = {
							'group' : response.group,
							'passes' : p
						};
						$scope.groups.splice($scope.groups.length, 0, o);
						$scope.groups.sort(function (a, b) {
							return a.group > b.group;
						});
						//$log.info($scope.groups);
					}
				});

				//$scope.pass.group = $scope.pass.resourceName = $scope.pass.resourceUrl = $scope.pass.login = $scope.pass.hashed_password = $scope.pass.comment = $scope.pass.accessedFor = '';
			};

			$scope.remove = function () {
				var passes = [];
				angular.forEach($scope.isPassSelected, function(group, gind) {
					angular.forEach(group, function(pass, pind) {
						if(pass === true)
							passes.splice(passes.length, 0, $scope.groups[gind].passes[pind]._id);
					});
				});
				Passwords.remove({
					passId : { 
						'$in' : passes
					}
				});
			/*
				$scope.groups.forEach(function (group) {
					group.passes.forEach(function (p) {
						if (p === pass) {
							group.passes.splice(group.passes.indexOf(p), 1);
						}
					});
				});*/			
			};

			$scope.update = function (pass, passField) {
				//$log.info(pass);
				//$log.info(passField);
				//pass.$update();
				Passwords.update({
					passId : pass._id
				}, pass);
			};
		}
	]);
