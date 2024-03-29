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
            var sEvent = {
                category: 0,
                code: 'servermanager::server::create',
                level: 'info',
                targetGroup: ['infrastructureAdmins'],
                title: 'New server was added',
                link: '/#!/servers',
                initPerson: req.user._id,
                extraInfo: {
                    actionName: 'added new server',
                    clean: newServer.ip + (newServer.location ? (' (' + newServer.location + ')') : '')
                }
            };
            var EventProcessor = require('meanio').events;
            EventProcessor.emit('notification', sEvent);
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
        return res.status(400).send('Empty request');
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
                                    }, {
                                        accessedFor: 0
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
        .findOne({
            _id: req.query.server
        }, function(err, server) {
            if (err) {
                console.log(err);
                return res.status(500).send(err);
            } else {
                if (server) {
                    Server
                        .remove({
                            _id: req.query.server
                        }, function(err) {
                            if (err) {
                                console.log(err);
                                return res.status(500).send(err);
                            } else {
                                var sEvent = {
                                    category: 0,
                                    code: 'servermanager::server::deleteServer',
                                    level: 'danger',
                                    targetGroup: 'infrastructureAdmins',
                                    title: 'Server was removed.',
                                    link: '/#!/servers',
                                    initPerson: req.user._id,
                                    extraInfo: {
                                        actionName: 'removed the server',
                                        clean: server.ip + (server.location ? (' (' + server.location + ')') : ''),
                                        info: server
                                    }
                                };
                                var EventProcessor = require('meanio').events;
                                EventProcessor.emit('notification', sEvent);
                                return res.status(200).send();
                            }
                        });
                } else {
                    return res.status(404).send('Server was not found');
                }
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
                var sEvent = {
                    category: 0,
                    code: 'servermanager::server::updateServer',
                    level: 'warning',
                    targetGroup: ['infrastructureAdmins'],
                    title: 'Server information was updated',
                    link: '/#!/servers/' + req.params.server,
                    initPerson: req.user._id,
                    extraInfo: {
                        actionName: 'modified the server',
                        context: {
                            model: 'Server',
                            field: 'ip',
                            _id: req.params.server
                        },
                        info: req.body.params.difs
                    }
                };
                var EventProcessor = require('meanio').events;
                EventProcessor.emit('notification', sEvent);
                return res.jsonp(updated);
            }
        });
};
