'use strict';

angular.module('mean.passmanager').controller('PassController', ['$scope', 'Global', 'Menus', '$rootScope', '$http', '$log', '$stateParams', 'Passwords', 'Users',
		function ($scope, Global, Menus, $rootScope, $http, $log, $stateParams, Passwords, Users) {
			$scope.global = Global;
			$scope.passId = $stateParams.passId;
			
			Users.query({}, function (users) {
				var lols = [];
				users.forEach(function(item) {
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
				$scope.passwords = [];
				$http.get('api/getPass', {params: {passId: $scope.passId}
				}).success(function (data) {
					$scope.passwords = [data];
				}).error(function () {
					$log.error('error');
				});
				/*Passwords.query({}, function (passwords) {
					$scope.passwords = passwords;
				});*/
			};

			/*$scope.add = function () {
				if (!$scope.passwords)
					$scope.passwords = [];

				var pass = new Passwords({
						group : $scope.pass.group,
						resourceName : $scope.pass.resourceName,
						resourceUrl : $scope.pass.resourceUrl,
						email : $scope.pass.email,
						login : $scope.pass.login,
						hash_password : $scope.pass.hash_password,
						comment : $scope.pass.comment,
						accessedFor : $scope.pass.accessedFor
					});

				pass.$save(function (response) {
					$scope.passwords.push(response);
				});

				//this.firstName = this.lastName = this.email = this.password = this.role = '';
			};*/

			/*$scope.remove = function (pass) {
				for (var i in $scope.passwords) {
					if ($scope.passwords[i] === pass) {
						$scope.passwords.splice(i, 1);
					}
				}

				pass.$remove();
			};*/

			$scope.update = function (pass, passField) {
				//pass.$update();
				Passwords.update({ passId:pass._id }, pass);
			};
		}
	]);
