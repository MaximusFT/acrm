'use strict';

angular.module('mean.system').controller('IndexController', ['$scope', '$rootScope', '$http', '$location', '$cookies', '$log', 'Global',
		function ($scope, $rootScope, $http, $location, $cookies, $log, Global) {
			$scope.global = Global;
			
			// LOGIN ON MAIN PAGE
			$scope.user = {};
			$scope.global = Global;
			$scope.global.registerForm = false;
			$scope.input = {
				type : 'password',
				placeholder : 'Password',
				confirmPlaceholder : 'Repeat Password',
				iconClass : '',
				tooltipText : 'Show password'
			};

			$scope.togglePasswordVisible = function () {
				$scope.input.type = $scope.input.type === 'text' ? 'password' : 'text';
				$scope.input.placeholder = $scope.input.placeholder === 'Password' ? 'Visible Password' : 'Password';
				$scope.input.iconClass = $scope.input.iconClass === 'icon_hide_password' ? '' : 'icon_hide_password';
				$scope.input.tooltipText = $scope.input.tooltipText === 'Show password' ? 'Hide password' : 'Show password';
			};

			// Register the login() function
			$scope.login = function () {
				$http.post('/login', {
					email : $scope.user.email,
					password : $scope.user.password
				})
				.success(function (response) {
					// authentication OK
					$scope.loginError = 0;
					$rootScope.user = response.user;
					$cookies.mode = response.user.roles.indexOf('admin') > -1 ? 'Administrator' : (response.user.roles.indexOf('manager') > -1 ? 'Manager' : (response.user.roles.indexOf('employee') > -1 ? 'Employee' : (response.user.roles.indexOf('authenticated') > -1 ? 'Not verified' : '?')));
					$rootScope.$emit('loggedin');
					window.location.reload();
				})
				.error(function () {
					$scope.loginerror = 'Authentication failed.';
				});
			};
		}
	]);
