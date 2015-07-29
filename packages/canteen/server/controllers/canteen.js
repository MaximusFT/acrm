'use strict';

var mongoose = require('mongoose'),
    User = mongoose.model('User');

exports.userData = function(req, res) {
    User
        .findOne({
            _id: req.user._id
        }, {
            name: 1,
            email: 1,
            phone: 1,
            department: 1
        })
        .populate({
            path: 'department',
            model: 'NewDepartment',
            select: 'title'
        })
        .exec(function(err, user) {
            if (err) {
                console.log(err);
                return res.status(500).send(err);
            } else {
                if (user)
                    return res.jsonp(user);
                else
                    return res.status(404).send('User was not found');
            }
        });
};
