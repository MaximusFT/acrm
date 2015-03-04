'use strict';

angular.module('mean.passmanager').controller('ModalInstanceCtrl', function($scope, $log, $http, $q, $modalInstance) {
    $scope.asyncSelected = '';
    $scope.users = [];
    $scope.selectedUsers = [];
    $scope.selectedLabels = [];
    $scope.comment = '';
    $scope.temp = {};
    $scope.temp.selectedDepartment = '';
    $scope.temp.selectedDepartments = [];
    $scope.isResShown = [];
    $scope.temp.tempPass = '';
    $scope.ok = function() {
        $log.info('ok');
        //$modalInstance.close($scope.selected.item);
    };
    $scope.editprp = $scope.modalOptions.editprp;
    $scope.newDepartment = $scope.server = $scope.site = {};
    $scope.parent = null;
    $scope.isSynchronized = false;
    $scope.types = [{
        name: 'Physical Server',
        val: 0
    }, {
        name: 'VPS/VDS',
        val: 1
    }];
    if ($scope.modalOptions.server)
        $scope.server = JSON.parse(JSON.stringify($scope.modalOptions.server));
    if ($scope.modalOptions.form)
        $scope.form = JSON.parse(JSON.stringify($scope.modalOptions.form));
    if ($scope.modalOptions.department)
        $scope.newDepartment = JSON.parse(JSON.stringify($scope.modalOptions.department));
    if ($scope.modalOptions.webreq) {
        $scope.getHttp1 = $http.get('/api/webrequest/' + $scope.modalOptions.webreq).success(function(response) {
            $scope.webreq = response;
        }).error(function(err) {
            $log.error(err);
        });
    }
    if ($scope.modalOptions.report)
        $scope.report = JSON.parse(JSON.stringify($scope.modalOptions.report));

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
        $http.get('/api/getNewDeps')
            .success(function(data) {
                //$log.info(data);
                $scope.departments = data;
                if ($scope.modalOptions && $scope.modalOptions.selectedID && $scope.departments) {
                    var result = $scope.departments.filter(function(dep) {
                        return dep._id === $scope.modalOptions.selectedID;
                    });
                    if (result.length > 0 && result[0]._id)
                        $scope.newDepartment.parent = result[0]._id;
                } else {
                    if ($scope.departments[0] && $scope.departments[0]._id)
                        $scope.newDepartment.parent = $scope.departments[0]._id;
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

    $scope.verifyAndSendForm = function(isFormValid, data) {
        //$log.info(isFormValid, data, typeof data);
        if (isFormValid) {
            $scope.modalOptions.ok(data);
        }
    };

    $scope.initMailConfig = function() {
        $http.get('/api/getMailConfig')
            .success(function(data) {
                if (data === 'needNewConfig') {
                    $scope.mailConfig = {};
                } else {

                    if (data.packageName === 'mailmanager')
                        $scope.mailConfig = data.data;
                }
            })
            .error(function() {
                $log.error('error');
            });
    };

    $scope.manualSynchronization = function() {
        $http.get('/api/getMailConfig')
            .success(function(data) {
                if (data === 'needNewConfig') {
                    $scope.noConfigs = true;
                    return;
                } else {

                    $http.get('/api/synchronizemailboxes')
                        .success(function(response, status) {
                            if (status === 200)
                                $scope.isSynchronized = true;
                        })
                        .error(function() {
                            $log.error('error');
                        });
                }
            })
            .error(function() {
                $log.error('error');
            });
    };

    $scope.formatDate = function(date) {
        return new Date(date).toLocaleString();
    };

    $scope.showRes = function(index) {
        $log.info(index);
        $scope.isResShown[index] = !$scope.isResShown[index];
    };
});
