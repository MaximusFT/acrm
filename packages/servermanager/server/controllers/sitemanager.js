'use strict';

var mongoose = require('mongoose'),
    Site = mongoose.model('Site');
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
            return res.jsonp(newSite);
        }
    });
};