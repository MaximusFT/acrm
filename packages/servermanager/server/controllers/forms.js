'use strict';

var mongoose = require('mongoose'),
    Form = mongoose.model('Form'),
    FormBindedData = mongoose.model('FormBindedData'),
    _ = require('lodash');

exports.forms = function(req, res) {
    if (!req.query || !req.query.site)
        return res.status(500).send('Empty query');
    Form
        .find({
            site: req.query.site
        }, function(err, forms) {
            if (err) {
                console.log(err);
                return res.status(500).send(err);
            } else {
                return res.jsonp(forms);
            }
        });
};

exports.create = function(req, res) {
    if (!req.body.params || !req.body.params.form)
        return res.status(500).send('Empty query');
    var newForm = new Form(req.body.params.form);
    newForm.save(function(err) {
        if (err) {
            console.log(err);
            return res.status(500).send(err);
        } else {
            var sEvent = {
                category: 0,
                code: 'servermanager::form::create',
                level: 'info',
                targetGroup: ['infrastructureAdmins', 'clientRequestAdmins'],
                title: 'New form was added',
                link: '/',
                initPerson: req.user._id,
                extraInfo: {
                    actionName: 'added new form for user requests processing',
                    clean: newForm.formId + ' on ' + newForm.uri
                }
            };
            var EventProcessor = require('meanio').events;
            EventProcessor.emit('notification', sEvent);
            return res.jsonp(newForm);
        }
    });
};

exports.form = function(req, res) {
    if (!req.query || !req.query.form)
        return res.status(500).send('Empty query');
    Form
        .findOne({
            _id: req.query.form
        }, function(err, form) {
            if (err) {
                console.log(err);
                return res.status(500).send(err);
            } else {
                if (form) {
                    FormBindedData
                        .find({
                            form: form._id
                        }, function(err, bindedData) {
                            if (err) {
                                console.log(err);
                                return res.status(500).send(err);
                            } else {
                                return res.jsonp({
                                    form: form,
                                    bindedData: bindedData
                                });
                            }
                        });
                } else
                    return res.status(500).send('Form was not found');
            }
        });
};

exports.update = function(req, res) {
    if (!req.body || !req.body.params || !req.body.params.difs || !req.params || !req.params.form)
        return res.status(500).send('Empty query');
    var form = {};
    _.forEach(req.body.params.difs, function(dif) {
        //console.log('dif', dif);
        if (dif.propertyName && dif.values.length === 2)
            form[dif.propertyName] = dif.values[1];
    });
    Form
        .findOneAndUpdate({
            _id: req.params.form
        }, {
            $set: form
        }, function(err, updated) {
            if (err) {
                console.log(err);
                return res.status(500).send(err);
            } else {
                //console.log('updated', updated);
                var sEvent = {
                    category: 0,
                    code: 'servermanager::form::update',
                    level: 'warning',
                    targetGroup: ['infrastructureAdmins', 'clientRequestAdmins'],
                    title: 'Form information was modified.',
                    link: '/#!/servers',
                    initPerson: req.user._id,
                    extraInfo: {
                        actionName: 'modified the form',
                        clean: _.map(req.body.params.difs, 'propertyName'),
                        info: req.body.params.difs
                    }
                };
                var EventProcessor = require('meanio').events;
                EventProcessor.emit('notification', sEvent);
                return res.jsonp(updated);
            }
        });
};

exports.delete = function(req, res) {
    if (!req.params || !req.params.form)
        return res.status(500).send('Empty query');
    Form
        .findOne({
            _id: req.params.form
        }, function(err, form) {
            if (err) {
                console.log(err);
                return res.status(500).send(err);
            } else {
                if (form) {
                    FormBindedData
                        .remove({
                            form: req.params.form
                        }, function(err, numAffected) {
                            if (err) {
                                console.log(err);
                                return res.status(500).send(err);
                            } else {
                                console.log(numAffected + ' formBindedData removed');
                                Form
                                    .remove({
                                        _id: req.params.form
                                    }, function(err) {
                                        if (err) {
                                            console.log(err);
                                            return res.status(500).send(err);
                                        } else {
                                            var sEvent = {
                                                category: 0,
                                                code: 'servermanager::form::delete',
                                                level: 'danger',
                                                targetGroup: ['infrastructureAdmins', 'clientRequestAdmins'],
                                                title: 'Form was removed.',
                                                link: '/#!/servers',
                                                initPerson: req.user._id,
                                                extraInfo: {
                                                    actionName: 'removed the form',
                                                    clean: form.formId + ' on ' + form.uri,
                                                    info: form
                                                }
                                            };
                                            var EventProcessor = require('meanio').events;
                                            EventProcessor.emit('notification', sEvent);
                                            res.status(200).send();
                                        }
                                    });
                            }
                        });
                } else {
                    return res.status(404).send('Form was not found');
                }
            }
        });
};

exports.formData = function(req, res) {
    if (!req.body || !req.body.params || !req.body.params.formData || !req.body)
        return res.status(500).send('Empty query');
    var formData = req.body.params.formData,
        form = req.body.params.form,
        actions = req.body.params.actions;
    FormBindedData
        .find({
            form: form
        }, function(err, forms) {
            if (err) {
                console.log(err);
                return res.status(500).send();
            } else {
                if (forms && forms.length === 0 || !forms) {
                    FormBindedData.create(formData, function(err) {
                        if (err) {
                            console.log(err);
                            return res.status(500).send(err);
                        } else {
                            Form
                                .update({
                                    _id: form
                                }, {
                                    $set: {
                                        actions: actions
                                    }
                                }, function(err, numAffected) {
                                    if (err) {
                                        console.log(err);
                                        return res.status(500).send(err);
                                    } else {
                                        console.log('updated form', numAffected);
                                        return res.status(200).send();
                                    }
                                });
                        }
                    });
                } else {
                    var fromReqToCheckForChanges = _.filter(formData, function(fd) {
                        return !!fd._id;
                    });
                    //console.log('data to check update', fromReqToCheckForChanges);
                    _.forEach(fromReqToCheckForChanges, function(fr) {
                        FormBindedData
                            .findOne({
                                _id: fr._id
                            }, function(err, checkForChanges) {
                                if (err) {
                                    console.log(err);
                                    return res.status(500).send(err);
                                } else {
                                    if (checkForChanges) {
                                        if (JSON.stringify(checkForChanges) !== JSON.stringify(fr)) {
                                            FormBindedData
                                                .update({
                                                    _id: fr._id
                                                }, {
                                                    $set: fr
                                                }, function(err, numAffected) {
                                                    if (err) {
                                                        console.log(err);
                                                        return res.status(500).send(err);
                                                    } else {
                                                        console.log('updated', numAffected);
                                                    }
                                                });
                                        }
                                    } else {
                                        return res.status(500).send('Form data was not found');
                                    }
                                }
                            });
                    });
                    var fromReqToInsert = _.filter(formData, function(fd) {
                        return !fd._id;
                    });
                    //console.log('data to insert', fromReqToInsert);
                    if (fromReqToInsert.length > 0) {
                        FormBindedData.create(fromReqToInsert, function(err) {
                            if (err) {
                                console.log(err);
                                return res.status(500).send(err);
                            } else {
                                Form
                                    .update({
                                        _id: form
                                    }, {
                                        $set: {
                                            actions: actions
                                        }
                                    }, function(err, numAffected) {
                                        if (err) {
                                            console.log(err);
                                            return res.status(500).send(err);
                                        } else {
                                            console.log('updated form', numAffected);
                                            return res.status(200).send();
                                        }
                                    });
                            }
                        });
                    } else {
                        Form
                            .update({
                                _id: form
                            }, {
                                $set: {
                                    actions: actions
                                }
                            }, function(err, numAffected) {
                                if (err) {
                                    console.log(err);
                                    return res.status(500).send(err);
                                } else {
                                    console.log('updated form', numAffected);
                                    return res.status(200).send();
                                }
                            });
                    }
                }
            }
        });
};

exports.deleteFormData = function(req, res) {
    if (!req.params || !req.params.formData)
        return res.status(500).send('Empty query');
    FormBindedData
        .remove({
            _id: req.params.formData
        }, function(err) {
            if (err) {
                console.log(err);
                return res.status(500).send(err);
            } else {
                return res.status(200).send();
            }
        });
};
