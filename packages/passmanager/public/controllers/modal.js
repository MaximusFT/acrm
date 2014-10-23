'use strict';

angular.module('mean.passmanager').controller('ModalInstanceCtrl', function ($scope, $log, $http, $modalInstance) {
	$scope.users = [];
	$scope.selectedUsers = [];
	$scope.ok = function () {
		$log.info('ok');
		//$modalInstance.close($scope.selected.item);
	};

	$scope.cancel = function () {
		$log.info('cancel');
		//$modalInstance.dismiss('cancel');
	};
	
	$scope.getUsers = function (val) {
		if (val.length > 0) {
			$http.get('/api/searchUsers', {
				params : {
					value : val
				}
			}).then(function ($response) {
				var users = [];
				$response.data.objects.forEach(function (person, index) {
					users.push(person.name + '(' + person.username + '), ' + person.email + ', ' + person.department);
					if(index === $response.data.length-1)
						return users;
				});
			});
		}
	};
	
	$scope.selectedUser = function(item, model, label) {
		$scope.selectedUsers.splice($scope.selectedUsers.length, 0, item);
	};
	
});