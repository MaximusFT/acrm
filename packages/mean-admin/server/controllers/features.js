'use strict';

var mongoose = require('mongoose'),
    FeaturesActivation = mongoose.model('FeaturesActivation'),
    User = mongoose.model('User'),
    Feature = mongoose.model('Feature'),
    _ = require('lodash');

exports.features = function(req, res) {
    if (!req.user)
        return res.status(401).send('Not authenticated');
    User
        .findOne({
            _id: req.user._id
        }, function(err, user) {
            if (err) {
                console.log(err);
                return res.status(500).send(err);
            } else {
                if (user && user.roles && user.roles.indexOf('admin') !== -1) {
                    Feature
                        .find({}, function(err, features) {
                            if (err) {
                                console.log(err);
                                return res.status(500).send(err);
                            } else {
                                return res.jsonp(features);
                            }
                        });
                } else
                    return res.status(403).send('Access denied');
            }
        });
};

exports.feature = function(req, res) {
    if (!req.body || !req.body.params || !req.body.params.feature)
        return res.status(500).send('Empty query');
    var feature = new Feature(req.body.params.feature);
    feature.save(function(err) {
        if (err) {
            console.log(err);
            return res.status(500).send(err);
        } else {
            return res.jsonp('ok');
        }
    });
};

exports.deleteFeature = function(req, res) {
    if (!req.params || !req.params.featureId)
        return res.status(500).send('Empty query');
    Feature
        .remove({
            _id: req.params.featureId
        }, function(err) {
            if (err) {
                console.log(err);
                return res.status(500).send(err);
            } else {
                return res.status(200).send('ok');
            }
        });
};

exports.provideFeature = function(req, res) {
    if (!req.body || !req.body.params || !req.body.params.users || !req.body.params.feature)
        return res.status(500).send('Empty query');
    var featureId = req.body.params.feature;
    FeaturesActivation
        .find({
            user: {
                $in: req.body.params.users
            }
        }, function(err, features) {
            if (err) {
                console.log(err);
                return res.status(500).send(err);
            } else {
                if (features && features.length) {
                    _.forEach(features, function(feature) {
                        if (_.map(feature.activated, 'feature').indexOf(featureId) === -1) {
                            feature.activated.push({
                                feature: featureId,
                                options: {}
                            });
                            feature.save(function(err) {
                                if (err) {
                                    console.log(err);
                                    return res.status(500).send(err);
                                }
                            });
                        }
                    });
                } else {
                    _.forEach(req.body.params.users, function(user) {
                        var newFeature = new FeaturesActivation({
                            user: user,
                            activated: [{
                                feature: featureId,
                                options: {}
                            }]
                        });
                        newFeature.save(function(err) {
                            if (err) {
                                console.log(err);
                                return res.status(500).send(err);
                            }
                        });
                    });
                }
            }
        });
};

exports.revokeFeature = function(req, res) {
    if (!req.body || !req.body.params || !req.body.params.users || !req.body.params.feature)
        return res.status(500).send('Empty query');
    FeaturesActivation
        .update({
            user: {
                $in: req.body.params.users
            }
        }, {
            $pull: {
                activated: {
                    feature: req.body.params.feature
                }
            }
        }, {
            multi: true
        }, function(err, updated) {
            if (err) {
                console.log(err);
                return res.status(500).send(err);
            } else {
                console.log('updated', updated);
            }
        });
};

exports.isFeatures = function(req, res) {
    if (!req.user)
        return res.status(401).send('Not authenticated');
    FeaturesActivation
        .findOne({
                user: req.user._id
            },
            function(err, feature) {
                if (err) {
                    console.log(err);
                    return res.status(500).send(err);
                } else {
                    return res.jsonp({
                        isFeatures: feature && feature.activated.length > 0
                    });
                }
            });
};

exports.getMyFeatures = function(req, res) {
    if (!req.user)
        return res.sttus(401).send('Not authenticated');
    FeaturesActivation
        .findOne({
                user: req.user._id
            },
            function(err, feature) {
                if (err) {
                    console.log(err);
                    return res.status(500).send(err);
                } else {
                    if (feature && feature.activated) {
                        var featuresactivations = _.map(feature.activated, 'feature');
                        Feature
                            .find({
                                _id: {
                                    $in: featuresactivations
                                }
                            }, function(err, features) {
                                if (err) {
                                    console.log(err);
                                    return res.status(500).send(err);
                                } else {
                                    return res.jsonp(features);
                                }
                            });
                    } else {
                        return res.jsonp([]);
                    }
                }
            });
};

exports.checkAccessFeature = function(req, res) {
    if (!req.user)
        return res.status(401).send('Not authenticated');
    User
        .findOne({
            _id: req.user._id
        }, function(err, user) {
            if (err) {
                console.log(err);
                return res.status(500).send(err);
            } else {
                FeaturesActivation
                    .findOne({
                        user: req.user._id
                    }, function(err, feature) {
                        if (err) {
                            console.log(err);
                            return res.status(500).send(err);
                        } else {
                            if (user && user.roles && user.roles.indexOf('admin') !== -1) {
                                return res.status(200).send('ok');
                            } else if (feature && feature.activated.length > 0) {
                                var result = _.filter(feature.activated, function(f) {
                                    return f.link === req.query.href;
                                });
                                if (result && result.length > 0)
                                    return res.status(200).send('ok');
                                else
                                    return res.status(403).send('Access denied');
                            } else {
                                return res.status(403).send('Access denied');
                            }
                        }
                    });
            }
        });
};
