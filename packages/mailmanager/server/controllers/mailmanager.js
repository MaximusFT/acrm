'use strict';

var mongoose = require('mongoose'),
    mailBox = mongoose.model('mailBox'),
    PackConfig = mongoose.model('PackConfig'),
    request = require('request'),
    _ = require('lodash');
var config = '';
// function reloadConfig() {

// PackConfig
//     .findOne({
//         packageName: 'mailmanager'
//     }, {
//         _id: 0,
//         packageName: 1,
//         data: 1
//     })
//     .exec(function(err, data) {
//         if (err) {
//             console.log(err);
//         } else config = data.data;

//     });
// }
// reloadConfig();
function sortMailboxes(arr) {
    var result = _.chain(arr)
        .groupBy('domain')
        .pairs()
        .map(function(currentItem) {
            return _.object(_.zip(['domain', 'data'], currentItem));
        })
        .value();
    return result;
}

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
    mailBox
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

            } else return res.jsonp(sortMailboxes(mails));

        });
};
exports.provideAccessForMailbox = function(req, res) {
    var users = req.body.users;
    var mails = req.body.mails;
    console.log(req.body);
    if (users) {
        mailBox
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

exports.revokeAccessForMailbox = function(req, res) {
    var users = req.body.users;
    var mails = req.body.mails;
    mailBox
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
exports.synchronizemailboxes = function(req, res) {
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


                //reloadConfig();
                request(config.mailHost + (config.isPfInDefFolder ? '/postfixadmin' : config.PfCustomFolder) + '/get_mailboxes.php', function(error, response, body) {
                    if (!error && response.statusCode === 200) {
                        var postfix = JSON.parse(body);
                        var onlyMailsFromPostfix = _.map(postfix, 'mail');
                        mailBox
                            .find({
                                // mail: {
                                //     $in: onlyMailsFromPostfix
                                // }
                                deleted: false
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
                                                mailBox.update({
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
                                            mailBox.create(newMails, function(err) {
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
                                                if (result2.length > 0 && (result[0].state !== result2[0].state + '')) {
                                                    // update element
                                                    mailBox
                                                        .update({
                                                            mail: result[0].mail
                                                        }, {
                                                            $set: {
                                                                // password: result[0].password,
                                                                state: result[0].state
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
                                        });
                                        return res.status(200).send();
                                    } else {
                                        mailBox.create(postfix, function(err) {
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
                });
            } else console.log('NO CONFIG TABLE');
        });
};
exports.getmailboxes = function(req, res) {
    mailBox.find({
        deleted: false
    }, function(err, response) {
        if (err) {
            console.log(err);
            return res.status(500).send(err);
        } else {
            return res.jsonp(sortMailboxes(response));
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
