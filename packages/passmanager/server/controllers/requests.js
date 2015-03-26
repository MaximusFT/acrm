'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Request = mongoose.model('Request'),
    //User = mongoose.model('User'),
    Pass = mongoose.model('Pass'),
    Department = mongoose.model('Department'),
    _ = require('lodash');

/**
 * Create request
 */
exports.create = function(req, res, next) {
    req.body.who = req.user._id;
    var request = new Request(req.body);

    var errors = req.validationErrors();
    console.log(errors);
    if (errors) {
        return res.status(400).send(errors);
    }

    request.save(function(err) {
        if (err) {
            console.log(err);
            return res.status(500).send(err);
        } else
            return res.jsonp(request);
    });
};

/**
 * Find department by id
 */
exports.request = function(req, res, next, id) {
    Request
        .findOne({
            _id: id
        })
        .exec(function(err, request) {
            if (err)
                return next(err);
            if (!request)
                return next(new Error('Failed to load Request ' + id));
            req.profile = request;
            next();
        });
};

/**
 * Delete an request
 */
exports.destroy = function(req, res) {
    if (req.body._id) {
        delete req.body._id;
    }
    Request
        .findById(req.params.requestId,
            function(err, request) {
                if (err) {
                    console.log(err);
                    return res.status(500).send(err);
                } else {
                    if (request) {
                        _.extend(request, req.body);
                        request.remove(function(err) {
                            if (err) {
                                res.render('error', {
                                    status: 500
                                });
                            } else {
                                res.jsonp(request);
                            }
                        });
                    } else {
                        return res.status(404).send('Request was not found');
                    }
                }
            });
};

/**
 * List of Requests
 */
exports.all = function(req, res) {
    Request
        .find()
        .populate('what')
        .populate('who', '-hashed_password -salt -provider -__v -refistrationDate')
        .lean()
        .exec(function(err, requests) {
            if (err) {
                console.log(err);
                return res.status(500).send(err);
            } else {
                if (!requests || requests.length === 0)
                    return res.jsonp(requests);
                else {
                    _(requests).forEach(function(r, ind) {
                        Department
                            .findById(r.who.department, function(err, dep) {
                                if (err) {
                                    res.render('error', {
                                        status: 500
                                    });
                                } else {
                                    r.who.department = dep.name;
                                    if (ind === requests.length - 1) {
                                        //console.log(requests);
                                        return res.jsonp(requests);
                                    }
                                }
                            });
                    });
                }
            }
        });
};

exports.confirmRequest = function(req, res) {
    var reqId = req.body.reqId;
    var type = req.body.type;
    if ((!reqId || !type) && type !== 0) {
        return res.render('error', {
            status: 500
        });
    }
    //0 - ?
    //1 - adding
    //2 - editing
    switch (type) {
        /*case 0:
		Request
		.findOne({
			_id : reqId
		})
		.populate('what')
		.exec(function (err, request) {
			if (err) {
				res.render('error', {
					status : 500
				});
			} else {
				Pass
				.update({
					_id : request.what._id
				}, {
					$push : {
						'accessedFor' : request.who
					}
				})
				.exec(function (err) {
					if (err) {
						return res.json(500, {
							error : err
						});
					}
					exports.rejectRequest(req, res);
				});
			}
		});
		break;*/
        case 1:
            Request
                .findOne({
                    _id: reqId
                })
                .populate('what')
                .exec(function(err, request) {
                    if (err) {
                        console.log(err);
                        return res.status(500).send(err);
                    } else {
                        var pass = new Pass(request.info);
                        var errors = req.validationErrors();
                        console.log(errors);
                        if (errors) {
                            return res.status(400).send(errors);
                        }
                        pass.save(function(err) {
                            console.log(err);
                            if (err) {
                                switch (err.code) {
                                    default: res.status(400).send('Please fill all the required fields');
                                }

                                return res.status(400);
                            }
                            exports.rejectRequest(req, res);
                        });
                    }
                });
            break;
        case 2:
            Request
                .findOne({
                    _id: reqId
                })
                .populate('what')
                .exec(function(err, request) {
                    if (err) {
                        console.log(err);
                        return res.status(500).send(err);
                    } else {
                        console.log(JSON.stringify(request));
                        var query = {};
                        _.forEach(request.info, function(param) {
                            query[param.propertyName] = param.values[1];
                        });
                        Pass
                            .update({
                                _id: request.what
                            }, {
                                $set: query
                            }, function(err) {
                                if (err) {
                                    console.log(err);
                                    return res.status(500).send(err);
                                } else {
                                    return res.status(200).send();
                                }
                            });
                    }
                });
            break;
    }
};

exports.rejectRequest = function(req, res) {
    var reqId = req.body.reqId;
    Request.findById(reqId, function(err, request) {
        if (err) {
            res.render('error', {
                status: 500
            });
        }
        if (!request) {
            return res.send(404);
        }
        _.extend(request, req.body);
        request.remove(function(err) {
            if (err) {
                return res.render('error', {
                    status: 500
                });
            } else {
                return res.jsonp(request);
            }
        });
    });
};

exports.getReqs = function(req, res) {
    if (!req.query.type)
        return res.render('Empty query', {
            status: 500
        });

    Request
        .find({
            type: req.query.type
        })
        .sort({
            'when': -1
        })
        .populate('what')
        .populate('who')
        .exec(function(err, reqs) {
            if (err) {
                return res.render(err, {
                    status: 500
                });
            } else {
                return res.jsonp(reqs);
            }
        });
};
