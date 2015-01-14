'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    CurrencyPrediction = mongoose.model('CurrencyPrediction');
    //_ = require('lodash');

/**
 * Create department
 */
exports.getCurrencyPredictions = function(req, res, next) {
    CurrencyPrediction
        .findOne({}, function(err, predictions) {
            if (err) {
                console.log(err);
                return res.status(500).send(err);
            } else {
                return res.jsonp(predictions);
            }
        });
};

exports.saveCurrencyPredictions = function(req, res, next) {
    if (!req.body.params || !req.body.params.cols || !req.body.params.rows)
        return res.status(500).send('Empty query');
    CurrencyPrediction
        .findOne({}, function(err, currencypredictions) {
            if (err) {
                console.log(err);
                return res.status(500).send(err);
            } else {
                if (currencypredictions) {
                    CurrencyPrediction
                        .update({
                            _id: currencypredictions._id
                        }, {
                            $set: {
                                cols: req.body.params.cols,
                                rows: req.body.params.rows
                            }
                        }, function(err, updated) {
                            if (err) {
                                console.log(err);
                                return res.status(500).send(err);
                            } else {
                                return res.jsonp('ok');
                            }
                        });
                } else {
                    var predictions = new CurrencyPrediction(req.body.params);
                    predictions.save(function(err) {
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
};
