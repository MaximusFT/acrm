'use strict';

var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    /* jshint ignore:start */
    Client = mongoose.model('Client'),
    /* jshint ignore:end */
    Feature = mongoose.model('Feature'),
    FeaturesActivation = mongoose.model('FeaturesActivation'),
    OnlineChatUser = mongoose.model('OnlineChatUser'),
    ChatOption = mongoose.model('ChatOption'),
    Message = mongoose.model('Message'),
    Channel = mongoose.model('Channel'),
    _ = require('lodash');

exports.getChatStats = function(req, res) {
    User
        .findOne({
            _id: req.user._id
        }, function(err, user) {
            if (err) {
                console.log(err);
                return res.status(500).send(err);
            } else {
                if (user) {
                    Feature
                        .findOne({
                            name: 'chatManager'
                        }, function(err, cmFeature) {
                            if (err) {
                                console.log(err);
                                return res.status(500).send(err);
                            } else {
                                if (cmFeature) {
                                    FeaturesActivation
                                        .findOne({
                                            $or: [{
                                                user: req.user._id
                                            }, {
                                                client: req.user._id
                                            }],
                                            activated: {
                                                $elemMatch: {
                                                    feature: cmFeature._id
                                                }
                                            }
                                        }, function(err, featuresactivation) {
                                            if (err) {
                                                console.log(err);
                                                return res.status(500).send(err);
                                            } else {
                                                if (featuresactivation || (user && user.roles && user.roles.indexOf('admin') !== -1)) {
                                                    Feature
                                                        .findOne({
                                                            name: 'chatFeature'
                                                        }, function(err, feature) {
                                                            if (err) {
                                                                console.log(err);
                                                                return res.status(500).send(err);
                                                            } else {
                                                                if (feature) {
                                                                    OnlineChatUser
                                                                        .find(function(err, onlineChatUsers) {
                                                                            if (err) {
                                                                                console.log(err);
                                                                                return res.status(500).send(err);
                                                                            } else {
                                                                                if (onlineChatUsers) {
                                                                                    var ids = _.map(onlineChatUsers, function(onlineChatUser) {
                                                                                        return onlineChatUser.user ? onlineChatUser.user : (onlineChatUser.client ? onlineChatUser.client : '0');
                                                                                    });
                                                                                    FeaturesActivation
                                                                                        .find({
                                                                                            $or: [{
                                                                                                user: {
                                                                                                    $in: ids
                                                                                                }
                                                                                            }, {
                                                                                                client: {
                                                                                                    $in: ids
                                                                                                }
                                                                                            }],
                                                                                            activated: {
                                                                                                $elemMatch: {
                                                                                                    feature: feature._id
                                                                                                }
                                                                                            }
                                                                                        })
                                                                                        .populate('user')
                                                                                        .populate('client')
                                                                                        .exec(function(err, featuresactivations) {
                                                                                            if (err) {
                                                                                                console.log(err);
                                                                                                return res.status(500).send(err);
                                                                                            } else {
                                                                                                if (featuresactivations) {
                                                                                                    var analysts = _.filter(featuresactivations, function(fa) {
                                                                                                        return !!fa.user;
                                                                                                    });
                                                                                                    var clients = _.filter(featuresactivations, function(fa) {
                                                                                                        var result = _.filter(fa.activated, function(faa) {
                                                                                                            return JSON.stringify(faa.feature) === JSON.stringify(feature._id);
                                                                                                        });
                                                                                                        return !!fa.client && result && result.length > 0 && result[0].options && result[0].options.role !== 'guest';
                                                                                                    });
                                                                                                    var guests = _.filter(featuresactivations, function(fa) {
                                                                                                        var result = _.filter(fa.activated, function(faa) {
                                                                                                            return JSON.stringify(faa.feature) === JSON.stringify(feature._id);
                                                                                                        });
                                                                                                        return !!fa.client && result && result.length > 0 && result[0].options && result[0].options.role === 'guest';
                                                                                                    });
                                                                                                    return res.jsonp({
                                                                                                        analysts: _.map(analysts, 'user'),
                                                                                                        clients: _.map(clients, 'client'),
                                                                                                        guests: _.map(guests, 'client')
                                                                                                    });
                                                                                                } else {
                                                                                                    return res.jsonp({
                                                                                                        analysts: [],
                                                                                                        clients: [],
                                                                                                        guests: []
                                                                                                    });
                                                                                                }
                                                                                            }
                                                                                        });
                                                                                } else {
                                                                                    return res.jsonp({
                                                                                        analysts: [],
                                                                                        clients: [],
                                                                                        guests: []
                                                                                    });
                                                                                }
                                                                            }
                                                                        });
                                                                } else {
                                                                    return res.status(500).send('Chat feature was not found');
                                                                }
                                                            }
                                                        });
                                                } else {
                                                    return res.status(403).send('User has not access to chat manager');
                                                }
                                            }
                                        });
                                } else {
                                    return res.status(500).send('Chat manager feature was not found');
                                }
                            }
                        });
                } else {
                    return res.status(500).send('Invalid user');
                }
            }
        });
};

exports.changeGuestMode = function(req, res) {
    console.log(req.body);
    if (!req.body || !req.body.params)
        return res.status(500).send('Empty query');
    User.findOne({
        _id: req.user._id
    }, function(err, user) {
        if (err) {
            console.log(err);
            return res.status(500).send(err);
        } else {
            if (user) {
                Feature
                    .findOne({
                        name: 'chatManager'
                    }, function(err, cmFeature) {
                        if (err) {
                            console.log(err);
                            return res.status(500).send(err);
                        } else {
                            FeaturesActivation
                                .findOne({
                                    $or: [{
                                        user: req.user._id
                                    }, {
                                        client: req.user._id
                                    }],
                                    activated: {
                                        $elemMatch: {
                                            feature: mongoose.Types.ObjectId(cmFeature._id)
                                        }
                                    }
                                }, function(err, featuresactivation) {
                                    if (err) {
                                        console.log(err);
                                        return res.status(500).send(err);
                                    } else {
                                        if (featuresactivation || (user && user.roles && user.roles.indexOf('admin') !== -1)) {
                                            ChatOption
                                                .findOne({}, function(err, chatOption) {
                                                    if (err) {
                                                        console.log(err);
                                                        return res.status(500).send(err);
                                                    } else {
                                                        if (chatOption) {
                                                            ChatOption
                                                                .update({
                                                                    _id: chatOption._id
                                                                }, {
                                                                    $set: {
                                                                        isGuestModeEnabled: req.body.params.isGuestModeEnabled
                                                                    }
                                                                }, function(err, updated) {
                                                                    if (err) {
                                                                        console.log(err);
                                                                        return res.status(500).send(err);
                                                                    } else {
                                                                        console.log('updated', updated);
                                                                        return res.jsonp('ok');
                                                                    }
                                                                });
                                                        } else {
                                                            var newChatOption = new ChatOption({
                                                                isGuestModeEnabled: req.body.params.isGuestModeEnabled
                                                            });
                                                            newChatOption.save(function(err) {
                                                                if (err) {
                                                                    console.log(err);
                                                                    return res.status(500).send(err);
                                                                } else {
                                                                    return res.jsonp('ok');
                                                                }
                                                            });
                                                        }
                                                    }
                                                });
                                        } else {
                                            return res.status(403).send('Access denied');
                                        }
                                    }
                                });
                        }
                    });
            } else {
                return res.status(500).send('Invalid user');
            }
        }
    });
};

exports.getGuestMode = function(req, res) {
    User.findOne({
        _id: req.user._id
    }, function(err, user) {
        if (err) {
            console.log(err);
            return res.status(500).send(err);
        } else {
            if (user) {
                Feature
                    .findOne({
                        name: 'chatManager'
                    }, function(err, cmFeature) {
                        if (err) {
                            console.log(err);
                            return res.status(500).send(err);
                        } else {
                            FeaturesActivation
                                .findOne({
                                    $or: [{
                                        user: req.user._id
                                    }, {
                                        client: req.user._id
                                    }],
                                    activated: {
                                        $elemMatch: {
                                            feature: mongoose.Types.ObjectId(cmFeature._id)
                                        }
                                    }
                                }, function(err, featuresactivation) {
                                    if (err) {
                                        console.log(err);
                                        return res.status(500).send(err);
                                    } else {
                                        if (featuresactivation || (user && user.roles && user.roles.indexOf('admin') !== -1)) {
                                            ChatOption
                                                .findOne({}, function(err, chatOption) {
                                                    if (err) {
                                                        console.log(err);
                                                        return res.status(500).send(err);
                                                    } else {
                                                        return res.jsonp(chatOption ? chatOption : {
                                                            isGuestModeEnabled: false
                                                        });
                                                    }
                                                });
                                        } else {
                                            return res.status(403).send('Access denied');
                                        }
                                    }
                                });
                        }
                    });
            } else {
                return res.status(500).send('Invalid user');
            }
        }
    });
};

exports.getChatUsers = function(req, res) {
    Feature
        .findOne({
            name: 'chatFeature'
        }, function(err, feature) {
            if (err) {
                console.log(err);
                return res.status(500).send(err);
            } else {
                if (feature) {
                    FeaturesActivation
                        .find({
                            activated: {
                                $elemMatch: {
                                    feature: mongoose.Types.ObjectId(feature._id)
                                }
                            }
                        })
                        .populate('user')
                        .populate('client')
                        .lean()
                        .exec(function(err, featuresactivations) {
                            if (err) {
                                console.log(err);
                                return res.status(500).send(err);
                            } else {
                                if (featuresactivations) {
                                    //logger.debug('SEARCH RESULTS: ', featuresactivations.length);
                                    var analysts = [];
                                    var admins = [];
                                    _.forEach(featuresactivations, function(fa) {
                                        var result = _.filter(fa.activated, function(f) {
                                            return JSON.stringify(f.feature) === JSON.stringify(feature._id);
                                        });
                                        if (result && result.length > 0) {
                                            if (fa.user && result[0].options && result[0].options.role === 'analyst_chat') {
                                                analysts.push(fa.user);
                                            }
                                            if (fa.user && result[0].options && result[0].options.role === 'admin_chat') {
                                                admins.push(fa.user);
                                            }
                                        }
                                    });
                                    var clients = [];
                                    _.forEach(featuresactivations, function(fa) {
                                        var result = _.filter(fa.activated, function(faa) {
                                            return JSON.stringify(faa.feature) === JSON.stringify(feature._id) && !!fa.client && !fa.user;
                                        });
                                        if (result && result.length > 0) {
                                            fa.client.analyst = result[0].options.analyst;
                                            if (result[0].options && result[0].options.role && result[0].options.role !== 'guest')
                                                clients.push(fa.client);
                                        }
                                    });
                                    return res.jsonp({
                                        analysts: analysts,
                                        clients: clients,
                                        admins: admins
                                    });
                                } else {
                                    //logger.debug('EMPTY RESULTS WERE SENT FOR ' + myRole + ' USER');
                                    return res.jsonp({});
                                }
                            }
                        });
                } else {
                    return res.status(500).send('Chat feature was not found');
                }
            }
        });
};

exports.getHistory = function(req, res) {
    if (!req.body.params || !req.body.params.first || !req.body.params.second)
        return res.status(400).send('Empty request');
    var between = [req.body.params.first, req.body.params.second];
    if (between[1] < between[0])
        between.reverse();
    Channel.findOne({
            between: {
                $all: between
            }
        }, {
            _id: 1
        })
        .exec(function(err, channel) {
            if (err) {
                console.log(err);
                return res.status(500).send(err);
            } else {
                if (channel === null) {
                    return res.jsonp([]);
                } else {
                    Message
                        .find({
                            channel: channel._id
                        })
                        .sort('time')
                        .populate('user', 'name username')
                        .populate('client', 'name username')
                        .exec(function(err, messages) {
                            if (err) {
                                console.log(err);
                                return res.status(500).send(err);
                            } else {
                                return res.jsonp(messages);
                            }
                        });
                }
            }
        });
};
