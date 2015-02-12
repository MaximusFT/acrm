'use strict';

var mongoose = require('mongoose'),
    //Server = mongoose.model('Server'),
    //Site = mongoose.model('Site'),
    Form = mongoose.model('Form'),
    FormBindedData = mongoose.model('FormBindedData'),
    _ = require('lodash'),
    request = require('request'),
    crypto = require('crypto');

function sendToInside(req, res, options, data, callback) {
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
    //console.log('POST DATA', postData);

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
    }, function(error, response, body) {
        if (!error && response.statusCode === 200) {
            if (body === 'Access denied' || body === 'Empty request') {
                res.status(403).send(body);
            } else {
                //console.log('ENCODED', body);
                var encoded = JSON.parse(body);
                postData.comments = encoded.comments;
                if (encoded.name)
                    postData.name = encoded.name;
                request.post({
                    url: 'https://my.teletrade-dj.com/webform/crm/web_request_form_add',
                    form: postData
                }, function(error, response, body) {
                    if (!error && response.statusCode === 200) {
                        //console.log(body);
                        callback(body);
                    }
                });
            }
        }
    });
}

function subscribeInJustclick(req, res, options, data, callback) {

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

    function checkHash(resp, authData) {
    	console.log(resp.error_code + '::' + resp.error_text + '::' + authData.user_rps_key);
        return crypto.createHash('md5').update(resp.error_code + '::' + resp.error_text + '::' + authData.user_rps_key).digest('hex') === resp.hash;
    }

    function send_(url, sendData, cb) {
        request.post({
            url: url,
            form: sendData
        }, function(error, response, body) {
            cb(response.body);
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
    if (tmpP.length > 0)
        sendData.lead_phone = tmpP[0].value;
    var tmpC = _.filter(data, function(d) {
        return d.htmlId === options.city;
    });
    if (tmpC.length > 0)
        sendData.lead_city = tmpC[0].value;
    sendData.doneurl2 = options.doneUrl;
    sendData.hash = getHash(sendData, authData);

    send_('http://' + options.userId + '.justclick.ru/api/AddLeadToGroup', sendData, function(resp) {
    	var response = JSON.parse(resp);
        callback(response, checkHash(response, authData));
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

exports.processUserRequest = function(req, res) {
    if (!req.body.formData || !req.body.href)
        return res.status(500).send('Empty query');
    var href = req.body.href,
        formData = req.body.formData;
    if (href.substr(href.length - 1, href.length) === '/')
        href = href.substr(0, href.length - 1);
    console.log('REQUEST FROM', href);
    console.log('FORM DATA', formData);
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
                                    console.log('BINDED DATA WAS FOUND', _.map(bindedData, 'htmlId'));
                                    _.forEach(bindedData, function(bd) {
                                        var result = _.filter(formData, function(fd) {
                                            return fd.htmlId === bd.htmlId;
                                        });
                                        if (result.length > 0)
                                            bd.value = result[0].value;
                                    });
                                    //IF IS INSIDE OPTION
                                    var insideOptions = _.filter(form.actions, function(fa) {
                                        return fa.name === 'Send to Inside';
                                    });
                                    if (insideOptions.length > 0 && insideOptions[0].isEnabled) {
                                        console.log('INSIDE SENDING');
                                        sendToInside(req, res, insideOptions[0].config, bindedData, function(response) {
                                            console.log('response from Inside', response);
                                        });
                                    }
                                    //IF IS JUSTCLICK OPTION
                                    var justclickOptions = _.filter(form.actions, function(fa) {
                                        return fa.name === 'Subscribe in JustClick';
                                    });
                                    if (justclickOptions.length > 0 && justclickOptions[0].isEnabled) {
                                        console.log('JUSTCLICK SENDING');
                                        subscribeInJustclick(req, res, justclickOptions[0].config, bindedData, function(response) {
                                            console.log('response from JustClick', response);
                                        });
                                    }
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
