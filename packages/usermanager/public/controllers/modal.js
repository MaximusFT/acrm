'use strict';

angular.module('mean.usermanager').controller('ModalInstanceCtrl1', function ($scope, $log, $http, $q, $modalInstance) {
	$scope.asyncSelected = '';
	$scope.users = [];
	$scope.selectedDepartments = [];
	$scope.selectedLabels = [];
	$scope.ok = function () {
		$log.info('ok');
		//$modalInstance.close($scope.selected.item);
	};

	$scope.cancel = function () {
		$log.info('cancel');
		//$modalInstance.dismiss('cancel');
	};
	$scope.getDepartments = function (val) {
		var defer = $q.defer();
		$http.get('/api/searchDepartments', {
			params: {
				value: val
			}
		})
		.success(function (data) {
			defer.resolve(data);
		})
		.error(function () {
			$log.error('error');
		});
		return defer.promise;
	};
	
	$scope.selectedDepartment = function(item, model, label) {
		if($scope.selectedLabels.indexOf(label) === -1) {
			$scope.selectedDepartments.splice($scope.selectedDepartments.length, 0, model._id);
			$scope.selectedLabels.splice($scope.selectedLabels.length, 0, label);
		}
	};
	
});