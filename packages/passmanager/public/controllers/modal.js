'use strict';

angular.module('mean.passmanager').controller('ModalInstanceCtrl', function($scope, $log, $http, $q, $modalInstance) {
    $scope.asyncSelected = '';
    $scope.users = [];
    $scope.selectedUsers = [];
    $scope.selectedLabels = [];
    $scope.comment = '';
    $scope.ok = function() {
        $log.info('ok');
        //$modalInstance.close($scope.selected.item);
    };
    $scope.editprp = $scope.modalOptions.editprp;
    $scope.newDepartment = {
        level: 0
    };

    $scope.cancel = function() {
        $log.info('cancel');
        //$modalInstance.dismiss('cancel');
    };
    $scope.getUsers = function(val) {
        var defer = $q.defer();
        $http.get('/api/searchUsers', {
                params: {
                    value: val
                }
            })
            .success(function(data) {
                defer.resolve(data);
            })
            .error(function() {
                $log.error('error');
            });
        return defer.promise;
    };

    $scope.initDeps = function() {
        $http.get('/api/getDeps')
            .success(function(data) {
                //$log.info(data);
                $scope.departments = data;
            })
            .error(function() {
                $log.error('error');
            });
    };

    $scope.initForHead = function() {
        $http.get('/api/getForHead')
            .success(function(data) {
                //$log.info(data);
                $scope.heads = data;
            })
            .error(function() {
                $log.error('error');
            });
    };

    $scope.selectedUser = function(item, model, label) {
        if ($scope.selectedLabels.indexOf(label) === -1) {
            $scope.selectedUsers.splice($scope.selectedUsers.length, 0, model._id);
            $scope.selectedLabels.splice($scope.selectedLabels.length, 0, label);
        }
    };

    $scope.setComment = function(value) {
        $scope.comment = value;
    };

    $scope.passChanged = function(val) {
        $scope.editprp.password = val;
    };

    $scope.verifyAndSendForm = function (newDepartment) {
    	if(!newDepartment || !newDepartment.title || !newDepartment.head || newDepartment.level === undefined || newDepartment.level === null || !newDepartment.parent)
    		$scope.isError = true;
    	else
    		$scope.modalOptions.ok(newDepartment);
    };
});
