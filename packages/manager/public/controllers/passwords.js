'use strict';

angular.module('mean.passwords').controller('PasswordsController', ['$scope', 'Global', 'Menus', '$rootScope', '$http', '$log', 'Passwords', 'Users',
		function ($scope, Global, Menus, $rootScope, $http, $log, Passwords, Users) {
			$scope.global = Global;
			Users.query({}, function (users) {
				var lols = [];
				users.forEach(function(item) {
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
						inTable : true
					}
				];
				$scope.pass = {};
			});

			$scope.init = function () {
				Passwords.query({}, function (passwords) {
					$scope.passwords = passwords;
					$log.info(passwords);
				});
			};

			$scope.add = function () {
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

				this.resourceName = this.resourceUrl = this.login = this.password = this.comment = this.accessedFor = '';
			};

			$scope.remove = function (pass) {
				for (var i in $scope.passwords) {
					if ($scope.passwords[i] === pass) {
						$scope.passwords.splice(i, 1);
					}
				}

				pass.$remove();
			};

			$scope.update = function (pass, passField) {
				pass.$update();
			};

		}
	]);
