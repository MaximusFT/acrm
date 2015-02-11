'use strict';

var mongoose = require('mongoose'),
    mailBox = mongoose.model('mailBox'),
    request = require('request'),
    //async = require('async'),
    _ = require('lodash');
global.mailServerUrl = 'http://rez.mailgroup.pro/';

function mailboxAdd(mailbox, res) {
    var newMailBox = new mailBox(mailbox);


    newMailBox.save(function(err) {
        if (err) {
            console.log(err);
            return res.status(500).send(err);
        } else return res.status(200).send();
    });

}
exports.boxFromFront = function(req, res) {
    //console.log(req.body.params.quota);
    //console.log(res);
    mailboxAdd(req.body.params, res);
    //     return res.status(200);
    // else
    //    return res.status(500);
    // var newMailBox = new mailBox(req.body.params);
    // console.log(newMailBox);
    // newMailBox.save(function(err) {
    //     if (err) {
    //         console.log(err);
    //         return res.status(500).send(err);
    //     }
    // });
};
exports.synchronizemailboxes = function(req, res) {
    request(global.mailServerUrl + 'postfixadmin/get_mailboxes.php', function(error, response, body) {
        if (!error && response.statusCode === 200) {
            //console.log(body); // Show the HTML for the Google homepage.
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



};
exports.dbfrom = function(req, res) {
    mailBox.find({}, function(err, persons) {
        if (err) {
            console.log(err);
            return res.status(500).send(err);
        } else {
            //console.log(persons);
            return res.jsonp(persons);
        }
    });
};

exports.getDomainList = function(req, res) {
    mailBox.find().distinct('domain', function(err, persons) {
        if (err) {
            console.log(err);
            return res.status(500).send(err);
        } else {
            console.log(persons);
            return res.jsonp(persons);
        }
    });
};

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
exports.getmailboxes = function(req, res) {
    mailBox.find({
        deleted: false
    }, function(err, response) {
        if (err) {
            console.log(err);
            return res.status(500).send(err);
        } else {
            //console.log(response);
            // var tt = sortMailboxes(response);
            // console.log(tt);
            return res.jsonp(sortMailboxes(response));
        }
    });
};




function delfromDb(value, index, ar) {
    mailBox.remove({
        _id: value
    }, function(err) {
        if (err) {
            console.log(err);
            return false;
        } else {
            console.log('delate');
        }
    });
}
exports.dbdel = function(req, res) {
    console.log(req.body.params);
    req.body.params.forEach(delfromDb);
};
