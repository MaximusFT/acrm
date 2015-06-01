'use strict';

var mongoose = require('mongoose'),
    //Server = mongoose.model('Server'),
    //Site = mongoose.model('Site'),
    Form = mongoose.model('Form'),
    FormBindedData = mongoose.model('FormBindedData'),
    NewWebreq = mongoose.model('NewWebreq'),
    FormProcessingReport = mongoose.model('FormProcessingReport'),
    _ = require('lodash'),
    request = require('request'),
    async = require('async'),
    crypto = require('crypto'),
    parseString = require('xml2js').parseString,
    safeParse = require('safe-json-parse/callback'),
    url = require('url'),
    Buffer = require('buffer').Buffer,
    Iconv = require('iconv').Iconv,
    config = require('meanio').loadConfig(),
    nodemailer = require('nodemailer');

function saveRequestInAcrm(actions, data, analyticsData, formId, callback) {
    var response = {
        action: 'ACRM'
    };
    var temp = _.filter(actions, function(fa) {
        return fa.name === 'Save in ACRM';
    });
    if (temp.length === 0 || temp.length > 0 && !temp[0].isEnabled) {
        return callback(response);
    }
    var options = temp[0].config;

    var requestData = {};
    requestData.department = new mongoose.Types.ObjectId(options.department);
    requestData.type = new mongoose.Types.ObjectId(options.type);
    requestData.fromForm = formId;
    requestData.analyticsInfo = analyticsData;
    if (options.comment)
        requestData.comment = options.comment;
    else
        requestData.comment = '';
    if (options.email) {
        var tmpE = _.filter(data, function(d) {
            return d.htmlId === options.email;
        });
        // if (tmpE.length === 0 || !tmpE[0].value) {
        //     response.error = 'Empty email value';
        //     return callback(response);
        // }
        if (tmpE.length > 0)
            requestData.email = tmpE[0].value;
    }
    var tmpN = _.filter(data, function(d) {
        return d.htmlId === options.name;
    });
    if (tmpN.length > 0)
        requestData.name = tmpN[0].value;
    if (options.surname) {
        var tmpSN = _.filter(data, function(d) {
            return d.htmlId === options.surname;
        });
        if (tmpSN.length > 0)
            requestData.surname = tmpSN[0].value;
    }
    var tmpP = _.filter(data, function(d) {
        return d.htmlId === options.phone;
    });
    if (tmpP.length > 0)
        requestData.phone = tmpP[0].value;

    _.forEach(options.checkboxes, function(chkb) {
        var tmp = _.filter(data, function(d) {
            return d.htmlId === chkb.field;
        });
        if (tmp.length > 0) {
            if (tmp[0].value && (chkb.ifTrue1 || chkb.ifTrue2 || chkb.ifTrue3)) {
                if (chkb.ifTrue1)
                    requestData.comment += (requestData.comment ? ' ' : '') + chkb.ifTrue1;
                var tmpIT2 = _.filter(data, function(tdd) {
                    return tdd.htmlId === chkb.ifTrue2;
                });
                if (tmpIT2.length > 0)
                    requestData.comment += (requestData.comment ? ' ' : '') + tmpIT2[0].value;
                if (chkb.ifTrue3)
                    requestData.comment += (requestData.comment ? ' ' : '') + chkb.ifTrue3;
            }
            if (!tmp[0].value && (chkb.ifFalse1 || chkb.ifFalse2 || chkb.ifFalse3)) {
                if (chkb.ifFalse1)
                    requestData.comment += (requestData.comment ? ' ' : '') + chkb.ifFalse1;
                var tmpIF2 = _.filter(data, function(tdd) {
                    return tdd.htmlId === chkb.ifFalse2;
                });
                if (tmpIF2.length > 0)
                    requestData.comment += (requestData.comment ? ' ' : '') + tmpIF2[0].value;
                if (chkb.ifFalse3)
                    requestData.comment += (requestData.comment ? ' ' : '') + chkb.ifFalse3;
            }
        }
    });

    if (analyticsData && analyticsData.ip && (analyticsData.ip === '195.138.91.97' || analyticsData.ip === '195.138.79.100' || analyticsData.ip === '195.138.79.98')) {
        requestData.state = 3;
        requestData.isRead = false;
    }

    var newNewWebreq = new NewWebreq(requestData);
    newNewWebreq.save(function(err) {
        if (err) {
            console.log(err);
            response.error = err;
            return callback(response);
        } else {
            response.res = newNewWebreq._id;
            return callback(response);
        }
    });
}

function sendToInside(actions, data, analyticsData, callback) {
    var response = {
        action: 'Inside'
    };
    var temp = _.filter(actions, function(fa) {
        return fa.name === 'Send to Inside';
    });
    if (temp.length === 0 || temp.length > 0 && !temp[0].isEnabled) {
        return callback(response);
    }
    var options = temp[0].config;

    // if (!options.email) {
    //     response.error = 'Empty email option';
    //     return callback(response);
    // }
    var postData = {};
    if (!options.isOfficeIdField) {
        postData.office_id = options.officeId;
    } else {
        var tmpOf = _.filter(data, function(d) {
            //console.log(d.htmlId, options.officeIdFieldOptions.field, typeof d.htmlId, typeof options.officeIdFieldOptions.field);
            return d.htmlId === options.officeIdFieldOptions.field;
        });
        if (tmpOf.length === 0) {
            //console.log('nope1');
            response.error = 'Empty office ID field value';
            return callback(response);
        }
        //console.log(tmpOf);
        if (options.officeIdOptType === 'byValue') {
            postData.office_id = tmpOf[0].value;
        }
        if (options.officeIdOptType === 'byAccord') {
            _.forEach(options.officeIdFieldOptions.officeIds, function(officeId, index) {
                //console.log(options.officeIdFieldOptions.officeIds[index], typeof options.officeIdFieldOptions.officeIds[index]);
                if (tmpOf[0].value === options.officeIdFieldOptions.values[index]) {
                    var parsed = parseInt(options.officeIdFieldOptions.officeIds[index]);
                    //console.log('parsed', parsed);
                    if (!isNaN(parsed)) {
                        postData.office_id = parsed;
                    } else {
                        response.error = 'Office ID is NaN (' + tmpOf[0].value + ')';
                        return callback(response);
                    }
                }
            });
        }
        if (!postData.office_id) {
            //console.log('nope2');
            response.error = 'Empty office ID field value';
            return callback(response);
        }
    }
    postData.type_id = options.reqType;
    postData.comments = options.comment;
    var tmpE = _.filter(data, function(d) {
        return d.htmlId === options.email;
    });
    // if (tmpE.length === 0) {
    //     response.error = 'Empty email value';
    //     return callback(response);
    // }
    if (tmpE.length > 0)
        postData.email = tmpE[0].value;
    var tmpN = _.filter(data, function(d) {
        return d.htmlId === options.name;
    });
    if (tmpN.length > 0)
        postData.name = tmpN[0].value;
    if (options.surname) {
        var tmpSN = _.filter(data, function(d) {
            return d.htmlId === options.surname;
        });
        if (tmpSN.length > 0)
            postData.surname = tmpSN[0].value;
    }
    var tmpP = _.filter(data, function(d) {
        return d.htmlId === options.phone;
    });
    if (tmpP.length > 0)
        postData.phone = tmpP[0].value;
    if (analyticsData.ip)
        postData.ip = analyticsData.ip;
    if (analyticsData.url_form)
        postData.url_form = encodeURI(analyticsData.url_form);
    if (analyticsData.url_local)
        postData.url_local = analyticsData.url_local;
    if (analyticsData.url_referer)
        postData.url_referer = encodeURI(analyticsData.url_referer);

    _.forEach(options.checkboxes, function(chkb) {
        var tmp = _.filter(data, function(d) {
            return d.htmlId === chkb.field;
        });
        if (tmp.length > 0) {
            if (tmp[0].value && (chkb.ifTrue1 || chkb.ifTrue2 || chkb.ifTrue3)) {
                if (chkb.ifTrue1)
                    postData.comments += ' ' + chkb.ifTrue1;
                var tmpIT2 = _.filter(data, function(tdd) {
                    return tdd.htmlId === chkb.ifTrue2;
                });
                if (tmpIT2.length > 0)
                    postData.comments += ' ' + tmpIT2[0].value;
                if (chkb.ifTrue3)
                    postData.comments += ' ' + chkb.ifTrue3;
            }
            if (!tmp[0].value && (chkb.ifFalse1 || chkb.ifFalse2 || chkb.ifFalse3)) {
                if (chkb.ifFalse1)
                    postData.comments += ' ' + chkb.ifFalse1;
                var tmpIF2 = _.filter(data, function(tdd) {
                    return tdd.htmlId === chkb.ifFalse2;
                });
                if (tmpIF2.length > 0)
                    postData.comments += ' ' + tmpIF2[0].value;
                if (chkb.ifFalse3)
                    postData.comments += ' ' + chkb.ifFalse3;
            }
        }
    });

    var transData = {
        comments: postData.comments
    };
    if (postData.name)
        transData.name = postData.name;

    request.post({
        url: 'http://mapqo.com/temporaryApi/conv.php',
        form: {
            txt: transData
        }
    }, function(error, resp, body) {
        if (!error && resp.statusCode === 200) {
            if (body === 'Access denied' || body === 'Empty request') {
                response.error = body;
                return callback(response);
            } else {
                //console.log('ENCODED', body);
                var encoded = JSON.parse(body);
                postData.comments = encoded.comments;
                if (encoded.name)
                    postData.name = encoded.name;
                request.post({
                    url: 'https://my.teletrade-dj.com/webform/crm/web_request_form_add',
                    form: postData,
                    encoding: null
                }, function(error, resp, body) {
                    if (!error && resp.statusCode === 200) {
                        //console.log(body);
                        var buf = new Buffer(body, 'binary');
                        body = new Iconv('CP1251', 'UTF-8').convert(buf).toString();
                        if (body.indexOf('id') === -1)
                            response.res = body;
                        else
                            response.res = body.split(':')[1].split('}])')[0].trim();
                        if (options.isOfficeIdField)
                            response.res += ' (Dynamic office ID: ' + postData.office_id + ')';
                        return callback(response);
                    } else {
                        response.error = error + ';' + body;
                        if (options.isOfficeIdField)
                            response.error += ' (Dynamic office ID: ' + postData.office_id + ')';
                        return callback(response);
                    }
                });
            }
        }
    });
}

function sendEmail(actions, data, callback) {
    var response = {
        action: 'Send email'
    };
    var temp = _.filter(actions, function(fa) {
        return fa.name === 'Send email';
    });
    if (temp.length === 0 || temp.length > 0 && !temp[0].isEnabled) {
        return callback(response);
    }
    var options = temp[0].config,
        htmlText = [],
        mailConfig = {},
        mailOptions = {
            subject: options.subject
        };

    if (options.isOurMailserver === 'yes') {
        mailConfig = config.mailer;
        mailOptions.from = (options.from ? options.from : 'ACRM Support Service') + '<' + (options.email && options.pass ? options.email : config.mailer.auth.user) + '>';
    } else {
        if (!options.email || !options.pass) {
            response.error = 'Empty email authentication config';
            return callback(response);
        } else {
            mailConfig = {
                service: 'SMTP',
                auth: {
                    user: options.email,
                    pass: options.pass
                }
            };
            mailOptions.from = options.from + ' <' + options.email + '>';
        }
    }

    _.forEach(options.titleText, function(titleText) {
        var temp = titleText[0] ? titleText[0] : '';
        if (titleText[1]) {
            var tmp = _.filter(data, function(d) {
                return d.htmlId === titleText[1];
            });
            if (tmp.length > 0)
                temp += tmp[0] ? (' ' + tmp[0].value) : '';
        }
        temp += titleText[2] ? (' ' + titleText[2]) : '';
        htmlText.push('<p>' + temp + '</p>');
    });
    _.forEach(options.bodyText, function(bodyText) {
        var temp = bodyText[0] ? bodyText[0] : '';
        if (bodyText[1]) {
            var tmp = _.filter(data, function(d) {
                return d.htmlId === bodyText[1];
            });
            if (tmp.length > 0)
                temp += tmp[0] ? (' ' + tmp[0].value) : '';
        }
        temp += bodyText[2] ? (' ' + bodyText[2]) : '';
        htmlText.push('<p>' + temp + '</p>');
    });
    _.forEach(options.footerText, function(footerText) {
        var temp = footerText[0] ? footerText[0] : '';
        if (footerText[1]) {
            var tmp = _.filter(data, function(d) {
                return d.htmlId === footerText[1];
            });
            if (tmp.length > 0)
                temp += tmp[0] ? (' ' + tmp[0].value) : '';
        }
        temp += footerText[2] ? (' ' + footerText[2]) : '';
        htmlText.push('<p>' + temp + '</p>');
    });

    mailOptions.html = htmlText.join('\n\n');

    if (options.recipients === 'self') {
        if (!options.self) {
            response.error = 'Empty recipients';
            return callback(response);
        }
        var tmp = _.filter(data, function(d) {
            return d.htmlId === options.self;
        });
        if (tmp.length > 0)
            mailOptions.to = tmp[0].value;
    } else {
        mailOptions.to = options.recipients;
    }

    var transport = nodemailer.createTransport(mailConfig);
    transport.sendMail(mailOptions, function(err, res) {
        if (err) {
            console.log(err);
            response.error = err;
            callback(response);
        } else {
            //console.log(response);
            response.res = res;
            return callback(response);
        }
    });
}

function subscribeInJustclick(actions, data, callback) {
    var response = {
        action: 'Justclick'
    };
    var temp = _.filter(actions, function(fa) {
        return fa.name === 'Subscribe in JustClick';
    });
    if (temp.length === 0 || temp.length > 0 && !temp[0].isEnabled) {
        return callback(response);
    }
    var options = temp[0].config;

    function http_build_query(formdata) {
        var numeric_prefix = '',
            arg_separator = '&';
        var key, use_val, use_key, i = 0,
            tmp_arr = [];

        for (key in formdata) {
            use_key = encodeURIComponent(key);
            use_val = encodeURIComponent((formdata[key].toString()));
            use_val = use_val.replace(/%20/g, '+');

            if (numeric_prefix && !isNaN(key)) {
                use_key = numeric_prefix + i;
            }
            tmp_arr[i] = use_key + '=' + use_val;
            i += 1;
        }

        return tmp_arr.join(arg_separator);
    }


    function getHash(params, authData) {
        params = http_build_query(params);
        params = params + '::' + authData.user_id + '::' + authData.user_rps_key;
        return crypto.createHash('md5').update(params).digest('hex');
    }

    /*function checkHash(resp, authData) {
        return crypto.createHash('md5').update(resp.error_code + '::' + resp.error_text + '::' + authData.user_rps_key).digest('hex') === resp.hash;
    }*/

    function send_(url, sendData, cb) {
        request.post({
            url: url,
            form: sendData
        }, function(error, resp, body) {
            console.log('justclick ztchk');
            if (!error) {
                cb(resp.body);
            } else {
                cb(null, error);
            }
        });
    }

    var authData = {
        user_id: options.userId,
        user_rps_key: options.userKey
    };
    var sendData = {
        'rid[0]': options.targetGroup
    };
    var tmpN = _.filter(data, function(d) {
        return d.htmlId === options.name;
    });
    if (tmpN.length > 0)
        sendData.lead_name = tmpN[0].value;
    var tmpE = _.filter(data, function(d) {
        return d.htmlId === options.email;
    });
    if (tmpE.length > 0)
        sendData.lead_email = tmpE[0].value;

    var tmpP = _.filter(data, function(d) {
        return d.htmlId === options.phone;
    });
    if (tmpP.length > 0 && tmpP[0].value)
        sendData.lead_phone = tmpP[0].value;
    var tmpC = _.filter(data, function(d) {
        return d.htmlId === options.city;
    });
    if (tmpC.length > 0)
        sendData.lead_city = tmpC[0].value;
    sendData.doneurl2 = options.doneUrl;
    sendData.hash = getHash(sendData, authData);

    send_('http://' + options.userId + '.justclick.ru/api/AddLeadToGroup', sendData, function(resp, error) {
        if (resp) {
            safeParse(resp, function(err, json) {
                response.res = err ? resp : json;
                return callback(response);
            });
        } else {
            response.error = error;
            return callback(response);
        }
    });
}

function sendSMS(actions, data, callback) {
    var response = {
        action: 'SMS'
    };
    var temp = _.filter(actions, function(fa) {
        return fa.name === 'Send SMS';
    });
    if (temp.length === 0 || temp.length > 0 && !temp[0].isEnabled) {
        return callback(response);
    }
    var options = temp[0].config;
    var sendData = {};
    var tmpP = _.filter(data, function(d) {
        return d.htmlId === options.phone;
    });
    if (tmpP.length === 0) {
        response.error = 'Phone option missed';
        return callback(response);
    } else {
        sendData.phone = tmpP[0].value;
    }
    var tmpN = _.filter(data, function(d) {
        return d.htmlId === options.name;
    });
    if (tmpN.length > 0)
        sendData.name = tmpN[0].value;
    if (options.appeal)
        sendData.textSms = options.appeal + ' ' + sendData.name + '! ' + options.textSms;
    else
        sendData.textSms = options.textSms;

    var src = '<?xml version="1.0" encoding="UTF-8"?>' +
        '<SMS>' +
        '<operations>' +
        '<operation>SEND</operation>' +
        '</operations>' +
        '<authentification>' +
        '<username>' + options.username + '</username>' +
        '<password>' + options.password + '</password>' +
        '</authentification>' +
        '<message>' +
        '<sender>' + options.from + '</sender>' +
        '<text>' + sendData.textSms + '</text>' +
        '</message>' +
        '<numbers>' +
        '<number messageID="msg11">' + sendData.phone + '</number>' +
        '</numbers>' +
        '</SMS>';

    //console.log('send sms', sendData);

    request.post({
        url: 'https://my.atompark.com/sms/xml.php',
        body: src,
        headers: {
            'Content-Type': 'text/xml'
        }
    }, function(error, resp, body) {
        parseString(body, function(err, result) {
            if (err) {
                response.error = err;
                return callback(response);
            } else {
                response.res = result;
                return callback(response);
            }
        });
    });
}

exports.getDocumentFields = function(req, res) {
    if (!req.query.href && !req.query.form)
        return res.status(500).send('Empty query');
    var href = req.query.href,
        formId = req.query.form;
    if (href.substr(href.length - 1, href.length) === '/')
        href = href.substr(0, href.length - 1);
    console.log('href:', href);
    var query = {};
    if (formId.indexOf('fc') === 0) {
        query.uri = href;
    } else {
        query.$or = [{
            uri: href,
            formId: formId
        }, {
            uri: url.parse(href).protocol + '//' + url.parse(href).hostname,
            formId: formId
        }];
    }
    Form
        .findOne(query)
        .populate('site', '-title -ip -comment -server')
        .exec(function(err, form) {
            if (err) {
                console.log(err);
                return res.status(500).send(err);
            } else {
                if (form && !form.throughAllSite && form.uri === href || form && form.throughAllSite && url.parse(form.site.uri).hostname === url.parse(href).hostname) {
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
                                    return res.jsonp({
                                        form: form.formId,
                                        fields: _.map(fields, 'htmlId')
                                    });
                                } else
                                    return res.status(500).send('Form binded data was not found');
                            }
                        });
                } else
                    return res.jsonp('Form was not found');
            }
        });
};

exports.processUserRequest = function(req, res) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With');
    if (!req.body.href)
        return res.status(500).send('Empty query');
    var href = req.body.href,
        formId = req.body.form,
        formData = req.body.formData ? req.body.formData : [],
        analyticsData = req.body.analyticsData;
    if (href.indexOf('?') !== -1)
        href = href.substring(0, href.indexOf('?'));
    if (href.substr(href.length - 1, href.length) === '/')
        href = href.substr(0, href.length - 1);
    if (href.indexOf('#') !== -1)
        href = href.substring(0, href.indexOf('#'));
    analyticsData.ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
    console.log('REQUEST FROM', href, formId);
    console.log('FORM DATA', formData);
    console.log('ANALYTICS DATA', analyticsData);
    var query = {};
    if (formId.indexOf('fc') === 0) {
        query.uri = href;
    } else {
        query.$or = [{
            uri: href,
            formId: formId
        }, {
            uri: url.parse(href).protocol + '//' + url.parse(href).hostname,
            formId: formId
        }];
    }
    Form
        .findOne(query)
        .populate('site', '-title -ip -comment -server')
        .lean()
        .exec(function(err, form) {
            if (err) {
                console.log(err);
                return res.status(500).send(err);
            } else {
                if (form && !form.throughAllSite && form.uri === href || form && form.throughAllSite && url.parse(form.site.uri).hostname === url.parse(href).hostname) {
                    console.log('FORM WAS FOUND', form.formId);
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
                                    async.series([
                                        function(callback) {
                                            saveRequestInAcrm(form.actions, bindedData, analyticsData, form._id, function(response) {
                                                callback(null, response);
                                            });
                                        },
                                        function(callback) {
                                            sendToInside(form.actions, bindedData, analyticsData, function(response) {
                                                callback(null, response);
                                            });
                                        },
                                        function(callback) {
                                            sendEmail(form.actions, bindedData, function(response) {
                                                callback(null, response);
                                            });
                                        },
                                        function(callback) {
                                            subscribeInJustclick(form.actions, bindedData, function(response) {
                                                callback(null, response);
                                            });
                                        },
                                        function(callback) {
                                            sendSMS(form.actions, bindedData, function(response) {
                                                callback(null, response);
                                            });
                                        }
                                    ], function(err, results) {
                                        var formProcessingReport = new FormProcessingReport({
                                            form: form._id,
                                            formData: formData,
                                            analyticsData: analyticsData,
                                            actionsPerformed: _.filter(results, function(res) {
                                                return res && (res.error || res.res);
                                            })
                                        });
                                        formProcessingReport.save(function(err) {
                                            if (err) {
                                                console.log(err);
                                                return res.status(500).send(err);
                                            } else {
                                                var options = {};
                                                var tempGA = _.filter(form.actions, function(fa) {
                                                    return fa.name === 'Google Analytics';
                                                });
                                                if (tempGA.length > 0 && tempGA[0].isEnabled) {
                                                    options.ga = tempGA[0].config;
                                                }
                                                var tempRF = _.filter(form.actions, function(fa) {
                                                    return fa.name === 'Replace form by thanksgiving block';
                                                });
                                                if (tempRF.length > 0 && tempRF[0].isEnabled) {
                                                    options.rf = tempRF[0].config;
                                                }
                                                //EVENT GENERATING
                                                var temp = _.filter(formProcessingReport.actionsPerformed, function(ap) {
                                                    return (ap.action === 'ACRM' && !ap.error) || (ap.action === 'Inside' && ap.res && ap.res.indexOf('formCallback') === -1 && ap.res.indexOf('error') === -1 && !ap.error);
                                                });
                                                if (temp.length > 0) {
                                                    var sEvent = {
                                                        category: 0,
                                                        code: 'clients::sendUserRequest',
                                                        level: 'info',
                                                        targetGroup: ['clientRequestManagers', 'clientRequestAdmins'],
                                                        title: 'New client request',
                                                        link: '/#!/requests',
                                                        initGroup: 'clients package',
                                                        extraInfo: {
                                                            actionName: 'New client request was received from ' + url.parse(href).hostname,
                                                            info: temp
                                                        }
                                                    };
                                                    var EventProcessor = require('meanio').events;
                                                    EventProcessor.emit('notification', sEvent);
                                                }
                                                //END EVENT GENERATING
                                                return res.jsonp(options);
                                            }
                                        });
                                    });
                                } else {
                                    console.log('Binded data was not found');
                                    return res.status(500).send('Binded data was not found');
                                }
                            }
                        });
                } else {
                    console.log('Form was not found');
                    return res.jsonp('Form was not found');
                }
            }
        });
};

exports.requestTypes = function(req, res) {
    return res.jsonp([{
        id: 1,
        title: 'Обратный звонок'
    }, {
        id: 2,
        title: 'Хочу учиться в офисе'
    }, {
        id: 3,
        title: 'Хочу инвестировать (ПерсТрейдер)'
    }, {
        id: 4,
        title: 'Хочу учиться дистанционно в Москве'
    }, {
        id: 5,
        title: 'Хочу инвест. в Москве (ПерсТрейдер)'
    }, {
        id: 6,
        title: 'Мастер-класс в Москве'
    }, {
        id: 7,
        title: 'Хочу учиться дистанционно'
    }, {
        id: 8,
        title: 'Сайт ПТ: Вопрос с сайта'
    }, {
        id: 9,
        title: 'Сайт ПТ: Стать инвестором'
    }, {
        id: 10,
        title: 'Сайт ПТ: Стать трейдером'
    }, {
        id: 11,
        title: 'Сайт ПТ: Вопрос трейдеру'
    }, {
        id: 12,
        title: 'Хочу демо счет'
    }, {
        id: 13,
        title: 'Мастер-инвест'
    }, {
        id: 14,
        title: 'Хочу работать'
    }, {
        id: 15,
        title: 'Конкурсы'
    }, {
        id: 16,
        title: 'Акции'
    }, {
        id: 17,
        title: 'Хочу бонус'
    }, {
        id: 18,
        title: '24% годовых'
    }, {
        id: 19,
        title: 'Вопрос менеджеру'
    }, {
        id: 20,
        title: 'Хочу зарабатывать'
    }, {
        id: 21,
        title: 'Хочу открыть счет'
    }, {
        id: 22,
        title: 'ЛК: Саморегистрация'
    }, {
        id: 23,
        title: 'ЛК: Саморегистрация (демо-счет)'
    }, {
        id: 24,
        title: 'ЛК: Саморегистрация (работа)'
    }, {
        id: 25,
        title: 'ЛК: Саморегистрация (агент)'
    }, {
        id: 26,
        title: 'ЛК: Саморегистрация (под агентом)'
    }, {
        id: 27,
        title: 'ЛК: Саморегистрация (юр.лицо)'
    }, {
        id: 28,
        title: 'ЛК: Саморегистрация (обучение)'
    }, {
        id: 29,
        title: 'Заказать обучающие материалы'
    }, {
        id: 30,
        title: 'Хочу торговые сигналы'
    }, {
        id: 31,
        title: 'Хочу электронную книгу'
    }, {
        id: 32,
        title: 'Хочу VIP счет'
    }, {
        id: 33,
        title: 'Мастер-инвест: мастер'
    }, {
        id: 34,
        title: 'Хочу учиться: новичкам'
    }, {
        id: 35,
        title: 'Телемагазин'
    }, {
        id: 36,
        title: 'Бизнес семинар'
    }, {
        id: 37,
        title: 'Школа миллионера. Забрать бонус'
    }, {
        id: 38,
        title: 'Школа миллионера. Перестал играть'
    }, {
        id: 39,
        title: 'Сайт БТ: Вопрос с сайта'
    }, {
        id: 40,
        title: 'Сайт БТ: Стать инвестором'
    }, {
        id: 41,
        title: 'Сайт БТ: Стать трейдером'
    }, {
        id: 42,
        title: 'Сайт БТ: Вопрос трейдеру'
    }, {
        id: 43,
        title: 'Школа миллионера. Регистрация'
    }, {
        id: 44,
        title: 'Хочу стать партнером'
    }, {
        id: 45,
        title: 'Хочу в демо конкурс'
    }, {
        id: 46,
        title: 'Школа трейдера. Получить бонус 1000'
    }, {
        id: 47,
        title: 'Школа трейдера. Перестал играть'
    }, {
        id: 48,
        title: 'Холодная рассылка: Мастер-класс'
    }, {
        id: 49,
        title: 'Финансовая справочная'
    }, {
        id: 50,
        title: 'Торговые сигналы'
    }, {
        id: 51,
        title: 'Хочу торговать на ВФБ'
    }, {
        id: 52,
        title: 'АБТ: Хочу учиться в офисе'
    }, {
        id: 53,
        title: 'АБТ: Хочу учиться дистанционно'
    }, {
        id: 54,
        title: 'АБТ: Регистрация на вебинар'
    }, {
        id: 55,
        title: 'АБТ: Обратный звонок'
    }]);
};
