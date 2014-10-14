'use strict';

angular.module('mean.passmanager').controller('PassmanagerController', ['$scope', 'Global', 'Passmanager',
		function ($scope, Global, Passmanager) {
			$scope.global = Global;
			$scope.package = {
				name : 'passmanager'
			};
		}
	]);

angular.module('mean.passmanager').controller('ModalInstanceCtrl', function ($scope, $log, $modalInstance) {
	$scope.ok = function () {
		$log.info('ok');
		//$modalInstance.close($scope.selected.item);
	};

	$scope.cancel = function () {
		$log.info('cancel');
		//$modalInstance.dismiss('cancel');
	};
});

angular.module('mean.passmanager').controller('PasswordsController', ['$scope', 'Global', 'Menus', '$rootScope', '$http', '$log', '$cookies', 'modalService', 'Passwords', 'Users', 'Requests',
		function ($scope, Global, Menus, $rootScope, $http, $log, $cookies, modalService, Passwords, Users, Requests) {
			$scope.mode = $cookies.mode;
			$scope.global = Global;			
			if($scope.mode === 'Administrator')
				$scope.btn_class = [];
			else
				$scope.btn_class = new Array([]);
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
						type : 'password',
						inTable : true
					}, {
						title : 'Comment',
						schemaKey : 'comment',
						type : 'text',
						inTable : false
					}, {
						title : 'Users with access',
						schemaKey : 'accessedFor',
						type : 'select',
						//options: ['none', 'me'],
						options : lols,
						inTable : true
					}
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
				$scope.btn_class[id] = 'btn btn-success';
			};
			
			$scope.toogleEditMode = function() {
				$scope.edit = !$scope.edit;
			};

			$scope.add = function () {
				if (!$scope.passwords)
					$scope.passwords = [];

				var pass = new Passwords({
						group : $scope.pass.group,
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

			$scope.remove = function (pass) {
				$scope.groups.forEach(function (group) {
					group.passes.forEach(function (p) {
						if (p === pass) {
							group.passes.splice(group.passes.indexOf(p), 1);
						}
					});
				});
				//pass.$remove();
				Passwords.remove({
					passId : pass._id
				});
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
