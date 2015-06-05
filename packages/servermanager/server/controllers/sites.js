'use strict';

var mongoose = require('mongoose'),
    Site = mongoose.model('Site'),
    Pass = mongoose.model('Pass');
//_ = require('lodash');

exports.create = function(req, res) {
    if (!req.body || !req.body.params || !req.body.params.site)
        return res.status(500).send('Empty query');
    var newSite = new Site(req.body.params.site);
    newSite.save(function(err) {
        if (err) {
            console.log(err);
            return res.status(500).send(err);
        } else {
            var sEvent = {
                category: 0,
                code: 'servermanager::site::create',
                level: 'info',
                targetGroup: 'infrastructureAdmins',
                title: 'New site was added',
                link: '/#!/servers/site/' + newSite._id,
                initPerson: req.user._id,
                extraInfo: {
                    actionName: 'added new site',
                    clean: newSite.uri
                }
            };
            var EventProcessor = require('meanio').events;
            EventProcessor.emit('notification', sEvent);
            return res.jsonp(newSite);
        }
    });
};

exports.deleteSite = function(req, res) {
    if (!req.params.site)
        return res.status(500).send('Empty query');
    Site
        .findOne({
            _id: req.params.site
        }, function(err, site) {
            if (err) {
                console.log(err);
                return res.status(500).send(err);
            } else {
                if (site) {
                    Site
                        .remove({
                            _id: req.params.site
                        }, function(err) {
                            if (err) {
                                console.log(err);
                                return res.status(500).send(err);
                            } else {
                                var sEvent = {
                                    category: 0,
                                    code: 'servermanager::site::deleteSite',
                                    level: 'danger',
                                    targetGroup: ['infrastructureAdmins'],
                                    title: 'Site was removed',
                                    link: '/#!/servers',
                                    initPerson: req.user._id,
                                    extraInfo: {
                                        actionName: 'removed the site',
                                        clean: site.uri,
                                        info: site
                                    }
                                };
                                var EventProcessor = require('meanio').events;
                                EventProcessor.emit('notification', sEvent);
                                return res.status(200).send();
                            }
                        });
                } else {
                    return res.status(404).send('Site was not found');
                }
            }
        });
};

exports.updateSite = function(req, res) {
    if (!req.params.site || !req.body.params || !req.body.params.key || !req.body.params.val)
        return res.status(500).send('Empty query');
    var t = {};
    t[req.body.params.key] = req.body.params.val;
    Site
        .findOne({
            _id: req.params.site
        }, function(err, site) {
            if (err) {
                console.log(err);
                return res.status(500).send(err);
            } else {
                Site
                    .update({
                        _id: req.params.site
                    }, {
                        $set: t
                    }, function(err, updated) {
                        if (err) {
                            console.log(err);
                            return res.status(500).send(err);
                        } else {
                            console.log('updated', updated);
                            var sEvent = {
                                category: 0,
                                code: 'servermanager::site::updateSite',
                                level: 'warning',
                                targetGroup: ['infrastructureAdmins'],
                                title: 'Site was modified',
                                link: '/#!/servers/site/' + req.params.site,
                                initPerson: req.user._id,
                                extraInfo: {
                                    actionName: 'removed the site',
                                    context: {
                                        model: 'Site',
                                        field: 'uri',
                                        _id: req.params.site
                                    },
                                    info: site
                                }
                            };
                            var EventProcessor = require('meanio').events;
                            EventProcessor.emit('notification', sEvent);
                            return res.status(200).send();
                        }
                    });
            }
        });
};

exports.getSite = function(req, res) {
    if (!req.params || !req.params.site)
        return res.status(500).send('Empty query');
    Site
        .findOne({
            _id: req.params.site
        })
        .populate('server', '-ips -location -type')
        .exec(function(err, site) {
            if (err) {
                console.log(err);
                return res.status(500).send(err);
            } else {
                if (site) {
                    if (JSON.stringify(req.user._id) === JSON.stringify(mongoose.Types.ObjectId('5485718617cbc47241ef8fe9')) || JSON.stringify(req.user._id) === JSON.stringify(mongoose.Types.ObjectId('545b5546cdc04778266abf2d'))) {
                        return res.jsonp({
                            site: site,
                            passwords: []
                        });
                    } else {
                        Pass
                            .find({
                                forSite: site._id
                            }, {
                                accessedFor: 0
                            }, function(err, passes) {
                                if (err) {
                                    console.log(err);
                                    return res.status(500).send(err);
                                } else {
                                    return res.jsonp({
                                        site: site,
                                        passwords: passes
                                    });
                                }
                            });
                    }
                } else
                    return res.status(500).send('Site was not found');
            }
        });
};

exports.sites = function(req, res) {
    Site
        .find(function(err, sites) {
            if (err) {
                console.log(err);
                return res.status(500).send(err);
            } else {
                return res.jsonp(sites);
            }
        });
};
