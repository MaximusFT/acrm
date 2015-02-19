'use strict';

var mongoose = require('mongoose'),
    Server = mongoose.model('Server'),
    Site = mongoose.model('Site'),
    Pass = mongoose.model('Pass'),
    _ = require('lodash');

exports.create = function(req, res) {
    if (!req.body || !req.body.params || !req.body.params.server)
        return res.status(500).send('Empty query');
    var temp = req.body.params.server;
    if (temp.ips)
        temp.ips = _.map(temp.ips, 'text');
    var newServer = new Server(req.body.params.server);
    newServer.save(function(err) {
        if (err) {
            console.log(err);
            return res.status(500).send(err);
        } else {
            return res.jsonp(newServer);
        }
    });
};

exports.servers = function(req, res) {
    console.log('get servers', req.body);
    Server
        .find({})
        .sort({
            ip: 1
        })
        .exec(function(err, servers) {
            if (err) {
                console.log(err);
                return res.status(500).send(err);
            } else {
                return res.jsonp(servers);
            }
        });
};

exports.server = function(req, res) {
    if (!req.query || !req.query.server)
        return res.status(500).send('Empty request');
    Server
        .findOne({
            _id: req.query.server
        }, function(err, server) {
            if (err) {
                console.log(err);
                return res.status(500).send(err);
            } else {
                if (server) {
                    Site
                        .find({
                            server: req.query.server
                        }, {
                            title: 1,
                            uri: 1,
                            ip: 1,
                            comment: 1
                        }, function(err, sites) {
                            if (err) {
                                console.log(err);
                                return res.status(500).send(err);
                            } else {
                                Pass
                                    .find({
                                        forServer: req.query.server
                                    }, function(err, passes) {
                                        if (err) {
                                            console.log(err);
                                            return res.status(500).send(err);
                                        } else {
                                            return res.jsonp({
                                                server: server,
                                                sites: sites,
                                                passwords: passes
                                            });
                                        }
                                    });
                            }
                        });
                } else {
                    return res.status(500).send('Server was not found');
                }
            }
        });
};

exports.deleteServer = function(req, res) {
    if (!req.query.server)
        return res.status(500).send('Empty query');
    Server
        .remove({
            _id: req.query.server
        }, function(err) {
            if (err) {
                console.log(err);
                return res.status(500).send(err);
            } else {
                return res.status(200).send();
            }
        });
};

exports.updateServer = function(req, res) {
    if (!req.body || !req.body.params || !req.body.params.difs || !req.params || !req.params.server)
        return res.status(500).send('Empty query');
    var server = {};
    _.forEach(req.body.params.difs, function(dif) {
        console.log('dif', dif);
        if (dif.propertyName && dif.values.length === 2)
            server[dif.propertyName] = dif.values[1];
    });
    console.log(server);
    Server
        .findOneAndUpdate({
            _id: req.params.server
        }, {
            $set: server
        }, function(err, updated) {
            if (err) {
                console.log(err);
                return res.status(500).send(err);
            } else {
                //console.log('updated', updated);
                return res.jsonp(updated);
            }
        });
};
