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
        console.log('dif', dif);
        if (dif.propertyName && dif.values.length === 2)
            form[dif.propertyName] = dif.values[1];
    });
    console.log(form);
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
                return res.jsonp(updated);
            }
        });
};

exports.delete = function(req, res) {
    if (!req.params || !req.params.form)
        return res.status(500).send('Empty query');
    Form
        .remove({
            _id: req.params.form
        }, function(err) {
            if (err) {
                console.log(err);
                return res.status(500).send(err);
            } else {
                res.status(200).send();
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
