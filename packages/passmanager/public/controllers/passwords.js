'use strict';

angular.module('mean.passmanager').controller('PassmanagerController', ['$scope', 'Global', 'Passmanager',
  function($scope, Global, Passmanager) {
    $scope.global = Global;
    $scope.package = {
      name: 'passmanager'
    };
  }
]);


angular.module('mean.passmanager').controller('PasswordsController', ['$scope', 'Global', 'Menus', '$rootScope', '$http', '$log', 'Passwords', 'Users',
		function ($scope, Global, Menus, $rootScope, $http, $log, Passwords, Users) {
			$scope.global = Global;
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

			$scope.add = function () {
				if (!$scope.passwords)
					$scope.passwords = [];

				var pass = new Passwords({
						group : $scope.pass.group,
						resourceName : $scope.pass.resourceName,
						resourceUrl : $scope.pass.resourceUrl,
						email: $scope.pass.email,
						login : $scope.pass.login,
						password : $scope.pass.password,
						comment : $scope.pass.comment,
						accessedFor : $scope.pass.accessedFor
					});

				pass.$save(function (response) {
					//$scope.passwords.push(response);
					var ret = false;
					$scope.groups.forEach(function(group) {
						if(group.group === response.group) {
							ret = true;
							group.passes.splice(group.passes.length, 0, response);
						}
					});
					if(!ret) {
						var p = [response];
						var o = {'group' : response.group, 'passes' : p};
						$scope.groups.splice($scope.groups.length, 0, o);
						$scope.groups.sort(function(a, b){
							return a.group > b.group;
						});
						//$log.info($scope.groups);
					}
				});

				//$scope.pass.group = $scope.pass.resourceName = $scope.pass.resourceUrl = $scope.pass.login = $scope.pass.hashed_password = $scope.pass.comment = $scope.pass.accessedFor = '';
			};

			$scope.remove = function (pass) {
				$scope.groups.forEach(function(group) {
					group.passes.forEach(function(p) {
						if(p === pass) {
							group.passes.splice(group.passes.indexOf(p), 1);
						}
					});
				});
				//pass.$remove();
				Passwords.remove({ passId:pass._id });
			};

			$scope.update = function (pass, passField) {	
				//$log.info(pass);
				//$log.info(passField);
				//pass.$update();
				Passwords.update({ passId:pass._id }, pass);
			};

		}
	]);
