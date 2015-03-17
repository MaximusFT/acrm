'use strict';

var mongoose = require('mongoose'),
    MailBox = mongoose.model('MailBox'),
    PackConfig = mongoose.model('PackConfig'),
    User = mongoose.model('User'),
    request = require('request'),
    _ = require('lodash');
var config = '';

function sortMailBoxes(arr) {
    var result = _.chain(arr)
        .groupBy('domain')
        .pairs()
        .map(function(currentItem) {
            return _.object(_.zip(['domain', 'data'], currentItem));
        })
        .value();
    return result;
}
exports.searchMailboxes = function(req, res) {
    var val = req.query.value;
    mailBox.find({}, {})
        .or([{
            'mail': {
                '$regex': new RegExp(val, 'i')
            }
        }])
        .exec(function(err, resault) {
            if (err) {
                res.render('error', {
                    status: 500
                });
            } else {
                return res.jsonp(resault);
            }
        });
};
exports.getConfig = function(req, res) {
    PackConfig
        .findOne({
            packageName: 'mailmanager'
        }, {
            _id: 0,
            packageName: 1,
            data: 1
        })
        .exec(function(err, config) {
            if (err) {
                console.log(err);
                return res.status(500).send(err);
            } else {
                if (!config)
                    return res.jsonp('needNewConfig');
                else
                    return res.jsonp(config);
            }

        });
};
exports.getAccessibleMails = function(req, res) {
    MailBox
        .find({
            accessedFor: req.user._id,
            state: 1,
            deleted: false
        }, {
            mail: 1,
            domain: 1,

        }, function(err, mails) {
            if (err) {
                console.log(err);
                return res.status(500).send(err);

            } else return res.jsonp(sortMailBoxes(mails));

        });
};
exports.getAccessibleMailsByName = function(req, res) {
    console.log(req.body);
    if (!req.body.params || !req.body.params.user)
        return res.status(500).send('Empty request');
    User
        .findOne({
            username: req.body.params.user
        })
        .exec(function(err, user) {
            if (err) {
                console.log(err);
                return res.status(500).send(err);
            } else {
                if (user) {
                    MailBox
                        .find({
                            accessedFor: user._id,
                            state: 1,
                            deleted: false
                        }, {
                            mail: 1,
                            domain: 1
                        }, function(err, mails) {
                            if (err) {
                                console.log(err);
                                return res.status(500).send(err);
                            } else
                                return res.jsonp(sortMailBoxes(mails));
                        });
                } else
                    return res.status(500).send('Invalid user');
            }
        });
};
exports.provideAccessForMailBox = function(req, res) {
    var users = req.body.users;
    var mails = req.body.mails;
    console.log(req.body);
    if (users) {
        MailBox
            .update({
                _id: {
                    $in: mails
                }
            }, {
                $addToSet: {
                    'accessedFor': {
                        $each: users
                    }
                }
            }, {
                multi: true
            })
            .exec(function(err) {
                if (err) {
                    return res.json(500, {
                        error: err
                    });
                } else {
                    return res.jsonp('ok');
                }
            });
    }
};

exports.revokeAccessForMailBox = function(req, res) {
    var users = req.body.users;
    var mails = req.body.mails;
    MailBox
        .update({
            _id: {
                $in: mails
            }
        }, {
            $pullAll: {
                'accessedFor': users
            }
        }, {
            multi: true
        })
        .exec(function(err) {
            if (err) {
                return res.json(500, {
                    error: err
                });
            } else {
                return res.jsonp('ok');
            }
        });
};
exports.synchronizeMailBoxes = function(req, res) {
    PackConfig
        .findOne({
            packageName: 'mailmanager'
        }, {
            _id: 0,
            packageName: 1,
            data: 1
        })
        .exec(function(err, data) {
            if (err) {
                console.log(err);
            } else
            if (data) {
                config = data.data;
                request(config.mailHost + (config.isPfInDefFolder ? '/postfixadmin' : config.PfCustomFolder) + '/get_mailboxes.php', function(error, response, body) {
                    if (!error && response.statusCode === 200) {
                        var postfix = JSON.parse(body);
                        var onlyMailsFromPostfix = _.map(postfix, 'mail');
                        MailBox
                            .find({
                                // mail: {
                                //     $in: onlyMailsFromPostfix
                                // }
                                //deleted: false
                            }, {
                                _id: 0,
                                created: 0,
                                title: 0,
                                domain: 0,
                                __v: 0
                            }, function(err, mails) {
                                if (err) {
                                    console.log(err);
                                    return res.status(500).send(err);
                                } else {
                                    if (mails) {
                                        var onlyMailsFromMongo = _.map(mails, 'mail');
                                        var notInBase = _.difference(onlyMailsFromPostfix, onlyMailsFromMongo);
                                        var notInPostfix = _.difference(onlyMailsFromMongo, onlyMailsFromPostfix);
                                        if (notInPostfix) {
                                            _.forEach(notInPostfix, function(mail, index) {
                                                MailBox.update({
                                                    mail: mail
                                                }, {
                                                    $set: {
                                                        deleted: true
                                                    }
                                                }, function(err, numAffected) {
                                                    if (err) {
                                                        console.log(err);
                                                        return res.status(500).send(err);
                                                    } else {
                                                        console.log('Mail', mail, 'set to DELETED');
                                                    }
                                                });
                                            });
                                        }
                                        var newMails = [];
                                        if (notInBase && notInBase.length > 0) {
                                            //insert this mails

                                            _.forEach(postfix, function(p) {
                                                if (notInBase.indexOf(p.mail) !== -1)
                                                    newMails.push(p);
                                            });
                                            MailBox.create(newMails, function(err) {
                                                if (err) {
                                                    console.log(err);
                                                    return res.status(500).send(err);

                                                } else {
                                                    return res.status(200).send();
                                                }
                                            });
                                        }
                                        var tryToCheckForModifies = _.difference(onlyMailsFromPostfix, newMails);
                                        _.forEach(tryToCheckForModifies, function(mail) {
                                            var result = _.filter(postfix, function(p) {
                                                return p.mail === mail;
                                            });
                                            if (result.length > 0) {
                                                var result2 = _.filter(mails, function(m) {
                                                    return m.mail === mail;
                                                });
                                                if (result2.length > 0) {
                                                    if ((result[0].state !== result2[0].state + '') || (result[0].messages + '' !== result2[0].messages + '') || (result[0].quota + '' !== result2[0].quota + '')) {
                                                        // update element
                                                        MailBox
                                                            .update({
                                                                mail: result[0].mail
                                                            }, {
                                                                $set: {
                                                                    state: result[0].state,
                                                                    quota: result[0].quota,
                                                                    messages: result[0].messages,
                                                                    deleted: false
                                                                }
                                                            }, function(err, numAffected) {
                                                                if (err) {
                                                                    console.log(err);
                                                                    return res.status(500).send(err);
                                                                } else {
                                                                    console.log('updated', numAffected);
                                                                }
                                                            });
                                                    }
                                                }
                                            }
                                        });
                                        return res.status(200).send();
                                    } else {
                                        MailBox.create(postfix, function(err) {
                                            if (err) {
                                                console.log(err);
                                                return res.status(500).send(err);
                                            } else {
                                                return res.status(200).send();
                                            }
                                        });
                                    }
                                }
                            });
                    }
                    else 
                        return res.status(500).send('Cant get mailboxes');
                });
            } else console.log('NO CONFIG TABLE');
        });
};
exports.getMailBoxes = function(req, res) {
    MailBox
        .find({
            deleted: false
        }, function(err, response) {
            if (err) {
                console.log(err);
                return res.status(500).send(err);
            } else {
                return res.jsonp(sortMailBoxes(response));
            }
        });
};
exports.getOneMailBox = function(req, res) {
    User
        .findOne({
exports.getMailboxesNoSort = function(req, res) {
    mailBox.find({
        deleted: false
    }, function(err, response) {
        if (err) {
            console.log(err);
            return res.status(500).send(err);
        } else {
            return res.jsonp(response);
        }
    });
};
exports.getOneMailbox = function(req, res) {
    User.findOne({
            _id: req.user._id,
        })
        .exec(function(err, user) {
            if (err) {
                console.log(err);
                return res.status(500).send(err);
            } else {
                if (user) {
                    MailBox
                        .findOne({
                            mail: req.body.mail,
                            deleted: false,
                        }, {})
                        .exec(function(err, resault) {
                            if (err) {
                                console.log(err);
                                return res.status(500).send(err);
                            } else {
                                if (resault) {
                                    if (user.roles.indexOf('admin') !== -1) {
                                        return res.jsonp(resault);
                                    } else {
                                        if (resault.accessedFor.indexOf(user._id) !== -1) {
                                            return res.jsonp(resault);
                                        } else {
                                            return res.status(403).send('Access denied');
                                        }
                                    }
                                } else {
                                    return res.status(204).send('Empty result');
                                }
                            }

                        });
                } else {
                    return res.status(500).send('Invalid user');
                }
            }
        });
};

exports.updateConfig = function(req, res) {
    PackConfig
        .findOne({
            packageName: 'mailmanager'
        })
        .exec(function(err, config) {
            if (err) {
                console.log(err);
                return res.status(500).send(err);
            } else {
                if (config) {
                    PackConfig
                        .update({
                            packageName: 'mailmanager'
                        }, {
                            $set: {
                                // password: result[0].password,
                                data: req.body.params.data
                            }
                        }, function(err) {
                            if (err) {
                                console.log(err);
                                return res.status(500).send(err);
                            } else {
                                console.log('config updated');
                                return res.status(200).send();
                            }
                        });
                } else {
                    var newConfig = new PackConfig(req.body.params);
                    newConfig.save(function(err) {
                        if (err) {
                            console.log(err);
                            return res.status(500).send(err);
                        } else return res.status(200).send();
                    });
                }

            }
        });
};
