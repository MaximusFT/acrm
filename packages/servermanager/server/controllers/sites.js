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
            req.sEvent = {
                category: 0,
                level: 'info',
                targetGroup: 'infrastructureAdmins',
                title: 'New site was added.',
                link: '/#!/servers/site/' + newSite._id,
                initPerson: req.user._id
            };
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
                                req.sEvent = {
                                    category: 0,
                                    level: 'danger',
                                    targetGroup: ['infrastructureAdmins'],
                                    title: 'Site was removed.',
                                    link: '/#!/servers',
                                    initPerson: req.user._id,
                                    extraInfo: site
                                };
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
                return res.status(200).send();
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
