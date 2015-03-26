'use strict';

angular.module('mean.system').controller('LayoutController', ['$scope', '$rootScope', '$http', '$location', '$cookies', '$log', 'Global',
		function ($scope, $rootScope, $http, $location, $cookies, $log, Global) {
			$scope.global = Global;
		}
	]);
