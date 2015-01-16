'use strict';

angular.module('mean.passmanager').controller('ModalInstanceCtrl', function($scope, $log, $http, $q, $modalInstance) {
    $scope.asyncSelected = '';
    $scope.users = [];
    $scope.selectedUsers = [];
    $scope.selectedLabels = [];
    $scope.comment = '';
    $scope.selectedDepartments = [];
    $scope.ok = function() {
        $log.info('ok');
        //$modalInstance.close($scope.selected.item);
    };
    $scope.editprp = $scope.modalOptions.editprp;
    $scope.newDepartment = {};
    $scope.parent = null;

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

                if($scope.modalOptions && $scope.modalOptions.selectedID && $scope.departments) {
                    var result = $scope.departments.filter(function(dep) {
                        return dep._id === $scope.modalOptions.selectedID;
                    });
                    if(result.length > 0)
                        $scope.newDepartment.parent = result[0];
                } else {
                    $scope.newDepartment.parent = $scope.departments[0];
                }
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
        //$log.warn(newDepartment);
    	if(!newDepartment || !newDepartment.title || !newDepartment.head ||!newDepartment.head._id || newDepartment.level === null || !newDepartment.parent || !newDepartment.parent._id)
    		$scope.isError = true;
    	else {
            newDepartment.head = newDepartment.head._id;
            newDepartment.parent = newDepartment.parent._id;
    		$scope.modalOptions.ok(newDepartment);
        }
    };
});
