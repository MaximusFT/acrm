'use strict';

var mongoose = require('mongoose'),
    mailBox = mongoose.model('MailBox'),
    PackConfig = mongoose.model('PackConfig'),
    User = mongoose.model('User'),
    request = require('request'),
    _ = require('lodash'),
    async = require('async');

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
exports.searchMailboxes = function(req, res) {
    var val = req.query.value;
    mailBox.find({}, {})
        .or([{
            'mail': {
                '$regex': new RegExp(val, 'i')
            }
        }])
        .exec(function(err, result) {
            if (err) {
                console.log(err);
                return res.status(500).send(err);
            } else {
                return res.jsonp(result);
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
    User
        .findOne({
            _id: req.user._id
        }, {
            roles: 1
        }, function(err, user) {
            if (err) {
                console.log(err);
                return res.status(500).send(err);
            } else {
                if (user && user.roles) {
                    if (user.roles.indexOf('admin') !== -1 || user.roles.indexOf('manager') !== -1 || user.roles.indexOf('employee') !== -1) {
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

                                } else
                                    return res.jsonp(sortMailboxes(mails));
                            });
                    } else
                        return res.status(403).send('Access denied');
                } else
                    return res.status(404).send('User was not found');
            }
        });
};
exports.getAccessibleMailsByName = function(req, res) {
    User.findOne({
            username: req.body.params.user
        })
        .exec(function(err, user) {
            if (err) {
                return res.status(500).send(err);
            } else {
                if (user) {
                    mailBox
                        .find({
                            accessedFor: user._id,
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
                } else {
                    return res.status(401).send('Invalid user');
                }
            }
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
                    accessedFor: {
                        $each: users
                    }
                }
            }, {
                multi: true
            })
            .exec(function(err) {
                if (err) {
                    console.log(err);
                    return res.status(500).send(err);
                } else {
                    User
                        .find({
                            _id: {
                                $in: users
                            }
                        }, {
                            name: 1
                        }, function(err, pusers) {
                            if (err) {
                                console.log(err);
                                return res.status(500).send(err);
                            } else {
                                mailBox
                                    .find({
                                        _id: {
                                            $in: mails
                                        }
                                    }, {
                                        mail: 1
                                    }, function(err, pmails) {
                                        if (err) {
                                            console.log(err);
                                            return res.status(500).send(err);
                                        } else {
                                            var sEvents = [{
                                                category: 0,
                                                code: 'mailmanager::provideAccessForMailbox',
                                                level: 'info',
                                                targetPersons: users,
                                                title: 'New mailbox' + (mails.length > 1 ? 'es were' : ' was') + ' shared with you',
                                                link: '/',
                                                initPerson: req.user._id,
                                                extraInfo: {
                                                    actionName: 'shared the mailbox' + (mails.length > 1 ? 'es' : '') + ' with you',
                                                    clean: _.map(pmails, 'mail').join(', ')
                                                }
                                            }, {
                                                category: 0,
                                                code: 'mailmanager::provideAccessForMailbox',
                                                level: 'warning',
                                                targetGroup: ['passAdmins'],
                                                title: 'User' + (users.length > 1 ? 's have' : ' has') + ' been assigned access to mailbox' + (mails.length > 1 ? 's.' : '.'),
                                                link: '/#!/mail/u',
                                                initPerson: req.user._id,
                                                extraInfo: {
                                                    actionName: 'shared the mailbox' + (mails.length > 1 ? 'es.' : '.') + ' with user' + (users.length > 1 ? 's' : ''),
                                                    clean: 'mailboxes - ' + _.map(pmails, 'mail').join(', ') + '; users - ' + _.map(pusers, 'name').join(', '),
                                                    info: {
                                                        mails: mails,
                                                        users: users
                                                    }
                                                }
                                            }];
                                            var EventProcessor = require('meanio').events;
                                            EventProcessor.emit('notifications', sEvents);
                                            return res.status(200).send();
                                        }
                                    });

                            }
                        });
                }
            });
    }
};

exports.revokeAccessForMailbox = function(req, res) {
    var users = req.body.users;
    var mails = req.body.mails;
    User
        .find({
            _id: {
                $in: users
            }
        }, {
            name: 1
        }, function(err, pusers) {
            if (err) {
                console.log(err);
                return res.status(500).send(err);
            } else {
                mailBox
                    .update({
                        _id: {
                            $in: mails
                        }
                    }, {
                        $pullAll: {
                            accessedFor: users
                        }
                    }, {
                        multi: true
                    })
                    .exec(function(err) {
                        if (err) {
                            console.log(err);
                            return res.status(500).send(err);
                        } else {
                            mailBox
                                .find({
                                    _id: {
                                        $in: mails
                                    }
                                }, {
                                    mail: 1
                                }, function(err, pmails) {
                                    if (err) {
                                        console.log(err);
                                        return res.status(500).send(err);
                                    } else {
                                        var sEvents = [{
                                            category: 0,
                                            code: 'mailmanager::revokeAccessForMailbox',
                                            level: 'info',
                                            targetPersons: users,
                                            title: 'Acess to the mailbox' + (mails.length > 1 ? 'es were' : ' was') + ' revoked',
                                            link: '/',
                                            initPerson: req.user._id,
                                            extraInfo: {
                                                actionName: 'revoked your access to the mailbox' + (mails.length > 1 ? 'es' : ''),
                                                clean: _.map(pmails, 'mail').join(', ')
                                            }
                                        }, {
                                            category: 0,
                                            code: 'mailmanager::revokeAccessForMailbox',
                                            level: 'warning',
                                            targetGroup: ['passAdmins'],
                                            title: 'User' + (users.length > 1 ? 's have' : ' has') + ' been revoked access to the mailbox' + (mails.length > 1 ? 'es.' : '.'),
                                            link: '/#!/mail/u',
                                            initPerson: req.user._id,
                                            extraInfo: {
                                                actionName: 'revoked the mailbox' + (mails.length > 1 ? 'es.' : '.') + ' for user' + (users.length > 1 ? 's' : ''),
                                                clean: 'mailboxes - ' + _.map(pmails, 'mail').join(', ') + '; users - ' + _.map(pusers, 'name').join(', '),
                                                info: {
                                                    mails: mails,
                                                    users: users
                                                }
                                            }
                                        }];
                                        var EventProcessor = require('meanio').events;
                                        EventProcessor.emit('notifications', sEvents);
                                        return res.status(200).send();
                                    }
                                });
                        }
                    });
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
                var config = data.data;
                request({  
                    uri: config.mailHost + (config.isPfInDefFolder ? '/postfixadmin' : config.PfCustomFolder) + '/' + config.filename,
                      method: 'GET',
                      timeout: 10000,
                      followRedirect: false
                }, function(error, response, body) {
                    if (!error && response.statusCode === 200) {
                        var postfix = JSON.parse(body);
                        var onlyMailsFromPostfix = _.map(postfix, 'mail');
                        mailBox
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
                                accessedFor: 0,
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
                                        var temp = {};
                                        if (notInPostfix) {
                                            mailBox
                                                .update({
                                                    mail: {
                                                        $in: notInPostfix
                                                    },
                                                    deleted: false
                                                }, {
                                                    $set: {
                                                        deleted: true
                                                    }
                                                }, {
                                                    multi: true
                                                }, function(err, numAffected) {
                                                    if (err) {
                                                        console.log(err);
                                                        return res.status(500).send(err);
                                                    } else {
                                                        console.log('Set to deleted ' + numAffected + ' fields');
                                                        temp.deleted = numAffected;
                                                        //return res.status(200);
                                                    }
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
                                                    console.log(newMails.length + ' new mailboxes were added to database');
                                                    temp.created = newMails.length;
                                                }
                                            });
                                        }
                                        var tryToCheckForModifies = _.difference(onlyMailsFromPostfix, newMails);
                                        var flows = [];
                                        _.forEach(tryToCheckForModifies, function(mail) {
                                            flows.push(function(callback) {
                                                var result = _.filter(postfix, function(p) {
                                                    return p.mail === mail;
                                                });
                                                if (result.length > 0) {
                                                    var result2 = _.filter(mails, function(m) {
                                                        return m.mail === mail;
                                                    });
                                                    if (result2.length > 0) {
                                                        if ((parseInt(result[0].state) !== parseInt(result2[0].state)) || (result[0].messages + '' !== result2[0].messages + '') || (parseInt(result[0].quota) !== parseInt(result2[0].quota))) {
                                                            // update element
                                                            mailBox
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
                                                                        callback(err);
                                                                    } else {
                                                                        callback(null, result[0].mail);
                                                                        temp.updated = (temp.updated ? temp.updated : 0) + 1;
                                                                    }
                                                                });
                                                        }
                                                    }
                                                }
                                            });
                                        });
                                        async.series(flows, function(err, results) {
                                            if (err) {
                                                console.log(err);
                                                return res.status(500).send('Error while trying to check modifies in mailboxes');
                                            } else {
                                                console.log('results', results);
                                                var sEvent = {
                                                    category: 0,
                                                    code: 'mailmanager::synchronizemailboxes',
                                                    level: 'warning',
                                                    targetGroup: ['mailAdmins'],
                                                    title: 'The synchronization of mailboxes was finished',
                                                    link: '/#!/mailmanager',
                                                    initPerson: req.user._id,
                                                    extraInfo: {
                                                        actionName: 'ran the synchronization of mailboxes',
                                                        clean: temp.created + ' items were created, ' + temp.updated + ' – updated, ' + temp.deleted + ' – marked as removed'
                                                    }
                                                };
                                                var EventProcessor = require('meanio').events;
                                                EventProcessor.emit('notification', sEvent);
                                                return res.status(200).send();
                                            }
                                        });
                                    } else {
                                        mailBox.create(postfix, function(err) {
                                            if (err) {
                                                console.log(err);
                                                return res.status(500).send(err);
                                            } else {
                                                var sEvent = {
                                                    category: 0,
                                                    code: 'mailmanager::synchronizemailboxes',
                                                    level: 'warning',
                                                    targetGroup: ['mailAdmins'],
                                                    title: 'The synchronization of mailboxes was finished',
                                                    link: '/#!/mailmanager',
                                                    initPerson: req.user._id,
                                                    extraInfo: {
                                                        actionName: 'ran the synchronization of mailboxes',
                                                        clean: postfix.length + ' items were created'
                                                    }
                                                };
                                                var EventProcessor = require('meanio').events;
                                                EventProcessor.emit('notification', sEvent);
                                                return res.status(200).send();
                                            }
                                        });
                                    }
                                }
                            });
                    } else
                        return res.status(500).send('Cant get mailboxes');
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
                    mailBox
                        .findOne({
                            mail: req.body.mail,
                            deleted: false,
                        }, {})
                        .exec(function(err, result) {
                            if (err) {
                                console.log(err);
                                return res.status(500).send(err);
                            } else {
                                if (result) {
                                    if (user.roles.indexOf('admin') !== -1) {
                                        return res.jsonp(result);
                                    } else {
                                        if (result.accessedFor.indexOf(user._id) !== -1) {
                                            return res.jsonp(result);
                                        } else {
                                            return res.status(403).send(err);
                                        }
                                    }
                                } else {
                                    return res.status(404).send(err);
                                }
                            }

                        });
                } else {
                    return res.status(401).send(err);
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
                        } else
                            return res.status(200).send();
                    });
                }

            }
        });
};

exports.deassignMailbox = function(req, res) {
    if (!req.body.mailbox)
        return res.status(400).send('Bad query');
    mailBox
        .update({
            _id: req.body.mailbox
        }, {
            $set: {
                accessedFor: []
            }
        }, function(err, numAffected) {
            if (err) {
                console.log(err);
                return res.status(500).send(err);
            } else {
                console.log('updated', numAffected);
                return res.status(200).send();
            }
        });
};
