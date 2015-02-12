'use strict';

angular.module('mean.servermanager').controller('SiteController', ['$scope', '$http', '$log', '$location', '$stateParams', 'Global', 'modalService',
    function($scope, $http, $log, $location, $stateParams, Global, modalService) {
        $scope.global = Global;
        $scope.forms = [];
        $scope.isVisibleRemoveButton = [];
        $scope.isError = [];
        $scope.saveEnabled = false;
        $scope.appointments = ['name', 'email', 'phone'];
        $scope.appointments2 = ['name', 'email', 'phone', 'city'];
        $scope.checkboxes = [];
        $scope.actions = [{
            name: 'Send to Inside',
            thead: ['Office ID', 'Request type', 'Text for request'],
            tbody: ['officeId', 'reqType', 'comment'],
            config: {}
        }, {
            name: 'Subscribe in JustClick',
            thead: ['JustClick account ID', 'API Key', 'Target group', 'Done URL'],
            tbody: ['userId', 'userKey', 'targetGroup', 'doneUrl'],
            config: {}
        }, {
            name: 'Send SMS',
            thead: ['Text for SMS'],
            tbody: ['textSms'],
            config: {}
        }];

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
                //$log.info('result', result);
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
            if (index)
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
                if (response.form.actions) {
                    angular.forEach($scope.actions, function(actionData, index) {
                        angular.forEach(response.form.actions, function(actionDataS) {
                            if (actionData.name === actionDataS.name)
                                $scope.actions[index] = actionDataS;
                        });
                    });
                }
                //$log.warn($scope.actions);
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
                htmlId: '',
                comment: '',
                form: $scope.selectedForm._id
            });
        };

        $scope.saveBindedData = function(data, actionsData) {
            $log.info(data, actionsData);
            $scope.isError = [];
            $scope.errors = [];
            angular.forEach(data, function(bindedData, index) {
                if (!bindedData.htmlId) {
                    if (!$scope.isError[index])
                        $scope.isError[index] = {};
                    $scope.isError[index] = true;
                }
            });
            angular.forEach(actionsData, function(actionData, index) {
                if (actionData.isEnabled) {
                    if (actionData.name === 'Send to Inside') {
                        if (!actionData.config.officeId) {
                            $scope.errors.push('Empty office ID field');
                        }
                        if (!actionData.config.reqType) {
                            $scope.errors.push('Empty request type field');
                        }
                        if (!actionData.config.comment) {
                            $scope.errors.push('Empty comment field');
                        }
                        if (!actionData.config.email) {
                            $scope.errors.push('Empty email field');
                        }
                        if (actionData.isCheckboxes && (!actionData.config.checkboxes || actionData.config.checkboxes.length === 0)) {
                            $scope.errors.push('Empty checkboxes data');
                        }
                        if (actionData.isCheckboxes && actionData.config.checkboxes) {
                            angular.forEach(actionData.config.checkboxes, function(chkbd, index2) {
                                if (!chkbd.field || !chkbd.ifTrue || !chkbd.ifFalse)
                                    $scope.errors.push('Incomplete data on the checkbox (' + (index2 + 1) + ' row)');
                            });
                        }
                    }
                }
            });
            if ($scope.isError.length === 0 && $scope.errors.length === 0) {
                var temp = [];
                angular.forEach(actionsData, function(actionData) {
                    if (actionData.isEnabled) {
                        temp.push(actionData);
                    }
                });
                $http.post('/api/formData', {
                    params: {
                        formData: data,
                        form: $scope.selectedForm._id,
                        actions: temp
                    }
                }).success(function(response) {
                    $scope.saveEnabled = false;
                    $scope.selectForm($scope.selectedForm);
                }).error(function(err) {
                    $log.error(err);
                });
            }
        };

        $scope.updateBindedData = function(data) {
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

        $scope.addCheckboxInfo = function(config) {
            if (!config.checkboxes)
                config.checkboxes = [];
            config.checkboxes.push({});
        };

        $scope.removeCheckboxData = function(index1, index2) {
            $scope.actions[index1].config.checkboxes.splice(index2, 1);
        };

        $scope.test = function() {
            $http.post('/api/sendUserRequest', {
                formData: [{
                    htmlId: 'webfm_sname',
                    value: 'TEST'
                }, {
                    htmlId: 'webfm_smail',
                    value: 'TEST@ABT.CO.UA'
                }],
                href: 'http://11.8-0.info'
            }).success(function(response) {
                $log.info(response);
            }).error(function(err) {
                $log.error(err);
            });
        };
    }
]);
