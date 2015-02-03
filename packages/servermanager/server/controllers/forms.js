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
        form = req.body.params.form;
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
                            res.status(200).send();
                        }
                    });
                } else {
                    FormBindedData.remove({
                        _id: {
                            $in: _.map(forms, '_id')
                        }
                    }, function(err) {
                        if (err) {
                            console.log(err);
                            return res.status(500).send(err);
                        } else {
                            FormBindedData.create(formData, function(err) {
                                if (err) {
                                    console.log(err);
                                    return res.status(500).send(err);
                                } else {
                                    res.status(200).send();
                                }
                            });
                        }
                    });
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
