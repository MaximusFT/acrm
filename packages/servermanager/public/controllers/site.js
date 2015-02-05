'use strict';

angular.module('mean.servermanager').controller('SiteController', ['$scope', '$http', '$log', '$location', '$stateParams', 'Global', 'modalService',
    function($scope, $http, $log, $location, $stateParams, Global, modalService) {
        $scope.global = Global;
        $scope.forms = [];
        $scope.isVisibleRemoveButton = [];
        $scope.isError = [];
        $scope.saveEnabled = false;
        $scope.appointments = ['Name', 'Email', 'Phone', 'Send to Inside', 'Subscribe in JustClick', 'Send SMS'];

        if (!$stateParams.siteId) {
            $location.path('/');
        } else {
            $scope.siteId = $stateParams.siteId;
        }

        $scope.init = function() {
            $scope.getHttp1 = $http.get('/api/servers/site/' + $scope.siteId).success(function(response) {
                $scope.site = response;
            }).error(function(err) {
                $log.error(err);
            });
        };

        $scope.initForms = function() {
            $scope.getHttp2 = $http.get('/api/forms', {
                params: {
                    site: $scope.siteId
                }
            }).success(function(response) {
                $scope.forms = response;
            }).error(function(err) {
                $log.error(err);
            });
        };

        $scope.updateSite = function(site, field) {
            $http.put('/api/servers/site/' + site._id, {
                params: {
                    key: field,
                    val: site[field]
                }
            }).error(function(err) {
                $log.error(err);
            });
        };

        $scope.addForm = function() {
            var modalOptions = {
                closeButtonText: 'Cancel',
                actionButtonText: 'Confirm',
                headerText: 'Adding form',
                bodyText: 'Specify information about new form.',
                type: 10
            };

            modalService.showModal({}, modalOptions).then(function(result) {
                $log.info('result', result);
                result.site = $scope.siteId;
                $http.post('/api/form', {
                    params: {
                        form: result
                    }
                }).success(function(response) {
                    $scope.forms.push(response);
                }).error(function(err) {
                    $log.error(err);
                });
            });
        };

        $scope.selectForm = function(form, index) {
            $scope.isVisibleRemoveButton = [];
            $scope.isVisibleRemoveButton[index] = true;
            $scope.getHttp3 = $http.get('/api/form', {
                params: {
                    form: form._id
                }
            }).success(function(response) {
                //$log.info(response);
                $scope.selectedForm = response.form;
                if (!response.bindedData)
                    $scope.bindedData = [];
                else
                    $scope.bindedData = response.bindedData;
            }).error(function(err) {
                $log.error(err);
            });
        };

        $scope.editForm = function(form) {
            var modalOptions = {
                closeButtonText: 'Cancel',
                actionButtonText: 'Confirm',
                headerText: 'Editing form',
                bodyText: 'Update information about form.',
                form: form,
                type: 10
            };

            modalService.showModal({}, modalOptions).then(function(result) {
                /* jshint ignore:start */
                var difs = [],
                    ips = [];
                for (var property in form) {
                    if (form[property] !== result[property]) {
                        var t = {};
                        t.propertyName = property;
                        t.values = [form[property], result[property]];
                        difs.splice(difs.length, 0, t);
                    }
                }
                $http.put('/api/form/' + form._id, {
                    params: {
                        difs: difs
                    }
                }).success(function(response) {
                    angular.forEach($scope.forms, function(s, index) {
                        if (s._id === response._id) {
                            $scope.forms.splice(index, 1);
                            $scope.forms.splice(index, 0, response);
                        }
                        if (s._id === $scope.selectedForm._id)
                            $scope.selectedForm = response;
                    });
                }).error(function(err) {
                    $log.error(err);
                });
                /* jshint ignore:end */
            });
        };

        $scope.removeForm = function(form, index) {
            //if ($scope.bindedData.length === 0) {
            $http.delete('/api/form/' + form._id).success(function(response) {
                $scope.forms.splice(index, 1);
                if ($scope.selectedForm._id === form._id)
                    $scope.selectedForm = null;
            }).error(function(err) {
                $log.error(err);
            });
            //}
        };

        $scope.addFormData = function() {
            $scope.bindedData.push({
                name: '',
                id: '',
                appointment: '',
                form: $scope.selectedForm._id,
                inForm: false
            });
        };

        $scope.saveBindedData = function(data) {
            //$log.info(data);
            $scope.isError = [];
            angular.forEach(data, function(bindedData, index) {
                if (bindedData.inForm === true && !bindedData.id) {
                    if (!$scope.isError[index])
                        $scope.isError[index] = {};
                    $scope.isError[index].id = true;
                }
                if (!bindedData.appointment) {
                    if (!$scope.isError[index])
                        $scope.isError[index] = {};
                    $scope.isError[index].appointment = true;
                } else {
                    if (['Send to Inside', 'Subscribe in JustClick', 'Send SMS'].indexOf(bindedData.appointment) !== -1 && !bindedData.value) {
                        if (!$scope.isError[index])
                            $scope.isError[index] = {};
                        $scope.isError[index].value = true;
                    }
                }
            });
            if ($scope.isError.length === 0) {
                $http.post('/api/formData', {
                    params: {
                        formData: data,
                        form: $scope.selectedForm._id
                    }
                }).success(function(response) {
                    $scope.bindedData = response;
                    $scope.saveEnabled = false;
                }).error(function(err) {
                    $log.error(err);
                });
            }
        };

        $scope.updateBindedData = function(data) {
            if (data) {
                if (['Name', 'Email', 'Phone'].indexOf(data.appointment) !== -1)
                    data.inForm = true;
                else
                    data.inForm = false;
            }
            $scope.saveEnabled = true;
        };

        $scope.removeBindedData = function(formData, index) {
            if (formData && formData._id) {
                $http.delete('/api/formData/' + formData._id).success(function(response) {
                    $scope.bindedData.splice(index, 1);
                    $scope.isError = [];
                }).error(function(err) {
                    $log.error(err);
                });
            } else {
                $scope.bindedData.splice(index, 1);
                $scope.isError = [];
            }
        };

        $scope.isValueFieldDisabled = function(appointment) {
            $log.info(appointment, $scope.appointments, $scope.appointments.indexOf(appointment) !== -1);
            return $scope.appointments.indexOf(appointment) !== -1;
        };
    }
]);
