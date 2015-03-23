'use strict';

angular.module('mean.system').controller('IndexController', ['$scope', '$rootScope', '$http', '$location', '$log', 'Global',
		function ($scope, $rootScope, $http, $location, $log, Global) {
			$scope.global = Global;
			
			$scope.myInterval = 5000;
			var slides = $scope.slides = [];
			$scope.addSlide = function () {
				var newWidth = 1 + slides.length;
				slides.push({
					image : '/system/assets/img/slider/' + newWidth + '.jpg'
					/*text : ['Learning from experience', 'Choosing the Right Approach', 'Your experience is important', 'We will help you to find a solution',
					'And share it with others'][slides.length % 5]*/
				});
			};
			$scope.addSlide();
			$scope.addSlide();
			$scope.addSlide();
			
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
					$rootScope.$emit('loggedin');
					window.location.reload();
				})
				.error(function () {
					$scope.loginerror = 'Authentication failed.';
				});
			};
		}
	]);
