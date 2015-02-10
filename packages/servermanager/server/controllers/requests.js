'use strict';

var mongoose = require('mongoose'),
    //Server = mongoose.model('Server'),
    //Site = mongoose.model('Site'),
    Form = mongoose.model('Form'),
    FormBindedData = mongoose.model('FormBindedData'),
    _ = require('lodash'),
    request = require('request');

/* jshint ignore:start */
var Iconv  = require('iconv').Iconv;
var UTF8 = (function() {
    return {
        // Encodes UCS2 into UTF8
        // Returns an array of numbers (bytes)
        encode: function(str) {
            var len = str.length;
            var result = [];
            var code;
            var i;
            for (i = 0; i < len; i++) {
                code = str.charCodeAt(i);
                if (code <= 0x7f) {
                    result.push(code);
                } else if (code <= 0x7ff) { // 2 bytes                     
                    result.push(0xc0 | (code >>> 6 & 0x1f),
                        0x80 | (code & 0x3f));
                } else if (code <= 0xd700 || code >= 0xe000) { // 3 bytes
                    result.push(0xe0 | (code >>> 12 & 0x0f),
                        0x80 | (code >>> 6 & 0x3f),
                        0x80 | (code & 0x3f));
                } else { // 4 bytes, surrogate pair
                    code = (((code - 0xd800) << 10) | (str.charCodeAt(++i) - 0xdc00)) + 0x10000;
                    result.push(0xf0 | (code >>> 18 & 0x07),
                        0x80 | (code >>> 12 & 0x3f),
                        0x80 | (code >>> 6 & 0x3f),
                        0x80 | (code & 0x3f));
                }
            }
            return result;
        },

        // Decodes UTF8 into UCS2
        // Returns a string
        decode: function(bytes) {
            var len = bytes.length;
            var result = "";
            var code;
            var i;
            for (i = 0; i < len; i++) {
                if (bytes[i] <= 0x7f) {
                    result += String.fromCharCode(bytes[i]);
                } else if (bytes[i] >= 0xc0) { // Mutlibytes
                    if (bytes[i] < 0xe0) { // 2 bytes
                        code = ((bytes[i++] & 0x1f) << 6) |
                            (bytes[i] & 0x3f);
                    } else if (bytes[i] < 0xf0) { // 3 bytes
                        code = ((bytes[i++] & 0x0f) << 12) |
                            ((bytes[i++] & 0x3f) << 6) |
                            (bytes[i] & 0x3f);
                    } else { // 4 bytes
                        // turned into two characters in JS as surrogate pair
                        code = (((bytes[i++] & 0x07) << 18) |
                            ((bytes[i++] & 0x3f) << 12) |
                            ((bytes[i++] & 0x3f) << 6) |
                            (bytes[i] & 0x3f)) - 0x10000;
                        // High surrogate
                        result += String.fromCharCode(((code & 0xffc00) >>> 10) + 0xd800);
                        // Low surrogate
                        code = (code & 0x3ff) + 0xdc00;
                    }
                    result += String.fromCharCode(code);
                } // Otherwise it's an invalid UTF-8, skipped.
            }
            return result;
        }
    };
}());

exports.sendTestRequest = function(req, res) {
    var postData = {};
    postData.office_id = 1799173;
    postData.type_id = 2;
    postData.email = req.body.params.email;
    postData.name = 'Вася Пупкин';
    postData.comments = 'Тестовая заявка: русский текст, english text, كرسي بالإنزال';
    console.log(postData);
    var iconv = new Iconv('UTF-8', 'UCS-2');
    var tb = iconv.convert(postData.comments);
    var encoded = UTF8.decode(tb);
    postData.comments = encoded;

    request.post({
        url: 'https://my.teletrade-dj.com/webform/crm/web_request_form_add',
        form: postData
    }, function(error, response, body) {
        if (!error && response.statusCode === 200) {
            console.log(body);
            return res.jsonp(body);
        }
    });
};

/* jshint ignore:end */

function sendToInside(req, res, options, data) {
    if (!options.email)
        return res.status(500).send('Empty email option');
    var postData = {};
    postData.office_id = options.officeId;
    postData.type_id = options.reqType;
    postData.comments = options.comment;
    var tmpE = _.filter(data, function(d) {
        return d.htmlId === options.email;
    });
    if (tmpE.length === 0)
        return res.status(500).send('Empty email value');
    postData.email = tmpE[0].value;
    var tmpN = _.filter(data, function(d) {
        return d.htmlId === options.name;
    });
    if (tmpN.length > 0)
        postData.name = tmpN[0].value;
    var tmpP = _.filter(data, function(d) {
        return d.htmlId === options.phone;
    });
    if (tmpP.length > 0)
        postData.phone = tmpP[0].value;
    _.forEach(options.checkboxes, function(chkb) {
        var tmp = _.filter(data, function(d) {
            return d.htmlId === chkb.field;
        });
        if (tmp.length > 0) {
            postData.comments = postData.comments + '. ' + (tmp[0].value ? chkb.ifTrue : chkb.ifFalse);
        }
    });

    request.post({
        url: 'https://my.teletrade-dj.com/webform/crm/web_request_form_add',
        form: postData
    }, function(error, response, body) {
        if (!error && response.statusCode === 200) {
            console.log(body);
            return res.jsonp(body);
        }
    });
}

exports.getDocumentFields = function(req, res) {
    if (!req.query.href)
        return res.status(500).send('Empty query');
    var href = req.query.href;
    if (href.substr(href.length - 1, href.length) === '/')
        href = href.substr(0, href.length - 1);
    Form
        .findOne({
            uri: href
        }, function(err, form) {
            if (err) {
                console.log(err);
                return res.status(500).send(err);
            } else {
                if (form) {
                    FormBindedData
                        .find({
                            form: form._id
                        }, {
                            htmlId: 1,
                            _id: 0
                        })
                        .lean()
                        .exec(function(err, fields) {
                            if (err) {
                                console.log(err);
                                return res.status(500).send(err);
                            } else {
                                if (fields) {
                                    //console.log(_.map(fields, 'htmlId'));
                                    return res.jsonp(_.map(fields, 'htmlId'));
                                } else
                                    return res.status(500).send('Form binded data was not found');
                            }
                        });
                } else
                    return res.status(500).send('Form was not found');
            }
        });
};

exports.sendUserRequest = function(req, res) {
    if (!req.body.formData || !req.body.href)
        return res.status(500).send('Empty query');
    var href = req.body.href,
        formData = req.body.formData;
    if (href.substr(href.length - 1, href.length) === '/')
        href = href.substr(0, href.length - 1);
    Form
        .findOne({
            uri: href
        })
        .lean()
        .exec(function(err, form) {
            if (err) {
                console.log(err);
                return res.status(500).send(err);
            } else {
                if (form) {
                    FormBindedData
                        .find({
                            form: form._id
                        })
                        .lean()
                        .exec(function(err, bindedData) {
                            if (err) {
                                console.log(err);
                                return res.status(500).send(err);
                            } else {
                                if (bindedData) {
                                    _.forEach(bindedData, function(bd) {
                                        var result = _.filter(formData, function(fd) {
                                            return fd.htmlId === bd.htmlId;
                                        });
                                        if (result.length > 0)
                                            bd.value = result[0].value;
                                    });
                                    var insideOptions = _.filter(form.actions, function(fa) {
                                        return fa.name === 'Send to Inside';
                                    });
                                    if (insideOptions.length > 0 && insideOptions[0].isEnabled)
                                        sendToInside(req, res, insideOptions[0].config, bindedData);
                                } else {
                                    console.log('Binded data was not found');
                                    return res.status(500).send('Binded data was not found');
                                }
                            }
                        });
                } else {
                    console.log('Form was not found');
                    return res.status(500).send('Form was not found');
                }
            }
        });
};
