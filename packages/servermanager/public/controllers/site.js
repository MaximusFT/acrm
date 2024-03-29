'use strict';

angular.module('mean.servermanager').controller('SiteController', ['$scope', '$http', '$log', '$location', '$stateParams', 'Global', 'modalService',
    function($scope, $http, $log, $location, $stateParams, Global, modalService) {
        $scope.global = Global;
        $scope.forms = [];
        $scope.isVisibleRemoveButton = [];
        $scope.isError = [];
        $scope.saveEnabled = false;
        $scope.appointments = ['name', 'surname', 'email', 'phone'];
        $scope.appointments2 = ['name', 'surname', 'email', 'phone', 'city'];
        $scope.appointments3 = ['name', 'phone'];
        $scope.checkboxes = [];
        $scope.actions = [{
            name: 'Save in ACRM',
            thead: ['Responsible department', 'Request type', 'Request comment'],
            tbody: ['department', 'type', 'comment'],
            config: {}
        }, {
            name: 'Send to Inside',
            thead: ['Office ID', 'Request type', 'Text for request'],
            tbody: ['officeId', 'reqType', 'comment'],
            config: {}
        }, {
            name: 'Google Analytics',
            thead: ['Version', 'Category', 'Action', 'Label', 'Value'],
            tbody: ['version', 'category', 'action', 'opt_label', 'opt_value'],
            config: {}
        }, {
            name: 'Subscribe in JustClick',
            thead: ['JustClick account ID', 'API Key', 'Target group', 'Done URL'],
            tbody: ['userId', 'userKey', 'targetGroup', 'doneUrl'],
            config: {}
        }, {
            name: 'Send email',
            thead: ['Email', 'Pass', 'From', 'Subject', 'Recipient(s)', 'Self', 'Is our mailserver'],
            tbody: ['email', 'pass', 'from', 'subject', 'recipients', 'self', 'isOurMailserver'],
            config: {
                titleText: [],
                bodyText: [],
                footerText: []
            }
        }, {
            name: 'Send SMS',
            thead: ['Username', 'Password', 'From', 'Text for SMS', 'Appeal'],
            tbody: ['username', 'password', 'from', 'textSms', 'appeal'],
            config: {}
        }, {
            name: 'Replace form by thanksgiving block',
            thead: ['Custom HTML'],
            tbody: ['thanksBlock']
        }];

        $scope.gaVersions = [{
            title: 'Old (ga.js)',
            id: 0
        }, {
            title: 'Universal (analytics.js)',
            id: 1
        }];

        if (!$stateParams.siteId) {
            $location.path('/');
        } else {
            $scope.siteId = $stateParams.siteId;
        }

        $scope.init = function() {
            $scope.getHttp1 = $http.get('/api/site/' + $scope.siteId).success(function(response) {
                //$log.info(response);
                $scope.site = response.site;
                $scope.referencedPasswords = response.passwords;
                $scope.crumbs = [{
                    title: 'Servers',
                    href: 'servers'
                }, {
                    title: $scope.site.server.ip,
                    href: 'servers/' + $scope.site.server._id
                }, {
                    title: $scope.site.title,
                    href: 'servers/site/' + $scope.site._id,
                    active: true
                }];
            }).error(function(err, status) {
                $log.error(err);
                $location.url('/error/' + status);
            });
        };

        $scope.initForms = function() {
            $scope.getHttp2 = $http.get('/api/forms', {
                params: {
                    site: $scope.siteId
                }
            }).success(function(response) {
                $scope.forms = response;
                if ($stateParams.formId) {
                    angular.forEach($scope.forms, function(form, index) {
                        if (form._id === $stateParams.formId)
                            $scope.selectForm(form, index);
                    });
                }
            }).error(function(err, status) {
                $log.error(err);
                $location.url('/error/' + status);
            });
        };

        $scope.initTypes = function() {
            $scope.getHttp4 = $http.get('/api/requestTypes').success(function(response) {
                $scope.requestTypes = response;
            }).error(function(err, status) {
                $log.error(err);
                $location.url('/error/' + status);
            });
        };

        $scope.initAcrmTypes = function() {
            $scope.getHttp5 = $http.get('/api/acrmRequestTypes').success(function(response) {
                $scope.acrmRequestTypes = response;
            }).error(function(err, status) {
                $log.error(err);
                $location.url('/error/' + status);
            });
        };

        $scope.initDeps = function() {
            $scope.getHttp6 = $http.get('/api/getNewDeps').success(function(response) {
                $scope.departments = response;
            }).error(function(err, status) {
                $log.error(err);
                $location.url('/error/' + status);
            });
        };

        $scope.updateSite = function(site, field) {
            $http.put('/api/servers/site/' + site._id, {
                params: {
                    key: field,
                    val: site[field]
                }
            }).error(function(err, status) {
                $log.error(err);
                $location.url('/error/' + status);
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
                }).error(function(err, status) {
                    $log.error(err);
                    $location.url('/error/' + status);
                });
            });
        };

        $scope.selectForm = function(form, index) {
            $scope.isVisibleRemoveButton = [];
            if (typeof index !== undefined || index !== null)
                $scope.isVisibleRemoveButton[index] = true;
            $scope.getHttp3 = $http.get('/api/form', {
                params: {
                    form: form._id
                }
            }).success(function(response) {
                //$log.info(response);
                $scope.selectedForm = response.form;
                $location.path('/servers/site/' + $stateParams.siteId + '/' + form._id);
                $scope.crumbs = [{
                    title: 'Servers',
                    href: 'servers'
                }, {
                    title: $scope.site.server.ip,
                    href: 'servers/' + $scope.site.server._id
                }, {
                    title: $scope.site.title,
                    href: 'servers/site/' + $scope.site._id
                }, {
                    title: $scope.selectedForm.name,
                    href: 'servers/site/' + $stateParams.siteId + '/' + form._id,
                    active: true
                }];
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
            }).error(function(err, status) {
                $log.error(err);
                $location.url('/error/' + status);
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
                for (var property in result) {
                    if (form[property] !== result[property] && typeof result[property] !== 'object') {
                        var t = {};
                        t.propertyName = property;
                        t.values = [form[property], result[property]];
                        difs.push(t);
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
                }).error(function(err, status) {
                    $log.error(err);
                    $location.url('/error/' + status);
                });
                /* jshint ignore:end */
            });
        };

        $scope.removeForm = function(form, index) {
            if ($scope.bindedData.length === 0) {
                $http.delete('/api/form/' + form._id).success(function(response) {
                    $scope.forms.splice(index, 1);
                    if ($scope.selectedForm._id === form._id)
                        $scope.selectedForm = null;
                }).error(function(err, status) {
                    $log.error(err);
                    $location.url('/error/' + status);
                });
            }
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
                            $scope.errors.push('Empty office ID field (Send to Inside)');
                        }
                        if (!actionData.config.reqType) {
                            $scope.errors.push('Empty request type field (Send to Inside)');
                        }
                        if (!actionData.config.comment) {
                            $scope.errors.push('Empty comment field (Send to Inside)');
                        }
                        // if (!actionData.config.email) {
                        //     $scope.errors.push('Empty email field (Send to Inside)');
                        // }
                        if (actionData.isCheckboxes && (!actionData.config.checkboxes || actionData.config.checkboxes.length === 0)) {
                            $scope.errors.push('Empty checkboxes data (Send to Inside)');
                        }
                        if (actionData.isCheckboxes && actionData.config.checkboxes) {
                            angular.forEach(actionData.config.checkboxes, function(chkbd, index2) {
                                if (chkbd.field && !chkbd.ifTrue1 && !chkbd.ifTrue2 && !chkbd.ifTrue3 && !chkbd.ifFalse1 && !chkbd.ifFalse2 && !chkbd.ifFalse3)
                                    $scope.errors.push('Incomplete data on the checkbox (' + (index2 + 1) + ' row) (Send to Inside)');
                            });
                        }
                    }
                    if (actionData.name === 'Google Analytics') {
                        if (!actionData.config.category)
                            $scope.errors.push('Empty category field (Google Analytics)');
                        if (!actionData.config.action)
                            $scope.errors.push('Empty action field (Google Analytics)');
                    }
                    if (actionData.name === 'Replace form by thanksgiving block') {
                        if (!actionData.config || !actionData.config.thanksBlock)
                            $scope.errors.push('Empty thanksgiving block (Replace form by thanksgiving block)');
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
                }).error(function(err, status) {
                    $log.error(err);
                    $location.url('/error/' + status);
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

        $scope.getPass = function(pass) {
            return pass;
        };

        $scope.showPass = function(index) {
            if (!$scope.isPassShown)
                $scope.isPassShown = [];
            $scope.isPassShown[index] = !$scope.isPassShown[index];
        };

        $scope.cloneSettings = function(action) {
            var ac;
            if (action.name === 'Save in ACRM') {
                angular.forEach($scope.actions, function(act) {
                    if (act.name === 'Send to Inside')
                        ac = act;
                });
                if (ac) {
                    ac.isEnabled = action.isEnabled;
                    if (action.isCheckboxes) {
                        ac.isCheckboxes = action.isCheckboxes;
                        ac.config.checkboxes = action.config.checkboxes;
                    }
                    if (action.config.name)
                        ac.config.name = action.config.name;
                    if (action.config.surname)
                        ac.config.surname = action.config.surname;
                    if (action.config.email)
                        ac.config.email = action.config.email;
                    if (action.config.phone)
                        ac.config.phone = action.config.phone;
                    if (action.config.comment)
                        ac.config.comment = action.config.comment;
                }
            }
            if (action.name === 'Send to Inside') {
                angular.forEach($scope.actions, function(act) {
                    if (act.name === 'Save in ACRM')
                        ac = act;
                });
                if (ac) {
                    ac.isEnabled = action.isEnabled;
                    if (action.isCheckboxes) {
                        ac.isCheckboxes = action.isCheckboxes;
                        ac.config.checkboxes = action.config.checkboxes;
                    }
                    if (action.config.name)
                        ac.config.name = action.config.name;
                    if (action.config.surname)
                        ac.config.surname = action.config.surname;
                    if (action.config.email)
                        ac.config.email = action.config.email;
                    if (action.config.phone)
                        ac.config.phone = action.config.phone;
                    if (action.config.comment)
                        ac.config.comment = action.config.comment;
                }
            }
        };

        $scope.activateDynOfficeId = function(config) {
            if (config.isOfficeIdField && !config.officeIdFieldOptions) {
                config.officeIdFieldOptions = {
                    values: [''],
                    officeIds: ['']
                };
            }
        };

        $scope.addOfficeIdOptions = function(config) {
            if (!config.officeIdFieldOptions.values)
                config.officeIdFieldOptions.values = [];
            config.officeIdFieldOptions.values.push('');
            if (!config.officeIdFieldOptions.officeIds)
                config.officeIdFieldOptions.officeIds = [];
            config.officeIdFieldOptions.officeIds.push('');
        };

        $scope.removeOfficeIdOptions = function(config, index) {
            $log.info(index);
            config.officeIdFieldOptions.values.splice(index, 1);
            config.officeIdFieldOptions.officeIds.splice(index, 1);
        };

        $scope.addRow = function(row) {
            row.push([]);
        };
    }
]);
