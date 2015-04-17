'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    async = require('async'),
    config = require('meanio').loadConfig(),
    crypto = require('crypto'),
    nodemailer = require('nodemailer'),
    templates = require('../template');

/**
 * Auth callback
 */
exports.authCallback = function(req, res) {
    res.redirect('/');
};

/**
 * Show login form
 */
exports.signin = function(req, res) {
    if (req.isAuthenticated()) {
        return res.redirect('/');
    }
    res.redirect('#!/login');
};

/**
 * Logout
 */
exports.signout = function(req, res) {
    req.logout();
    res.redirect('/');
};

/**
 * Session
 */
exports.session = function(req, res) {
    res.redirect('/');
};

function passwordStrength(pass) {
    var score = 0;
    if (!pass)
        return score;

    // award every unique letter until 5 repetitions
    var letters = {};
    for (var i = 0; i < pass.length; i += 1) {
        letters[pass[i]] = (letters[pass[i]] || 0) + 1;
        score += 5.0 / letters[pass[i]];
    }

    // bonus points for mixing it up
    var variations = {
        digits: /\d/.test(pass),
        lower: /[a-z]/.test(pass),
        upper: /[A-Z]/.test(pass),
        nonWords: /\W/.test(pass),
    };

    var variationCount = 0;
    for (var check in variations) {
        variationCount += (variations[check] === true) ? 1 : 0;
    }
    score += (variationCount - 1) * 10;
    console.log('password strength', score);
    return parseInt(score);
}

function isNonLatinInUsername(username) {
    console.log('isNonLatinInUsername');
    var containNotLatin = false;
    for (var i = 0; i < username.length; i = i + 1) {
        containNotLatin = containNotLatin || (username.charCodeAt(i) > 127); // basic latin end at 0x7F (127) 
    }
    console.log('result', containNotLatin);
    return containNotLatin;
}

/**
 * Create user
 */
exports.create = function(req, res, next) {
    var user = new User(req.body);

    user.provider = 'local';
    // because we set our user.provider to local our models/user.js validation will always be true
    req.assert('name', 'You must enter your name').notEmpty();
    req.assert('email', 'You must enter a valid email address').isEmail();
    req.assert('password', 'Password must be between 8-20 characters long').len(8, 20);
    req.assert('username', 'Username cannot be more than 20 characters').len(1, 20);
    req.assert('confirmPassword', 'Passwords do not match').equals(req.body.password);
    var errors = req.validationErrors();
    if (!errors)
        errors = [];
    // VALIDATE NAME (at least 2 words)
    if (user.name.split(' ').length < 2)
        errors.push({
            params: 'name',
            msg: 'You must enter your FULL name (name and surname)',
            value: user.name
        });
    // VALIDATE USERNAME (only transliterated)
    if (isNonLatinInUsername(user.username)) {
        errors.push({
            params: 'username',
            msg: 'The username cannot contain non-latin characters',
            value: user.username
        });
    }
    // VALIDATE PASSWORD
    if (passwordStrength(user.password) < 50) {
        errors.push({
            params: 'password',
            msg: 'The password must be more difficult',
            value: user.password
        });
    }

    if (errors && errors.length > 0) {
        return res.status(400).send(errors);
    }

    user.roles = ['authenticated'];
    if (req.body.task === 10001) {
        user.save(function(err) {
            if (err) {
                //console.log(err);
                switch (err.code) {
                    case 11000:
                        res.status(400).send([{
                            msg: 'Username already taken',
                            param: 'username'
                        }]);
                        break;
                    case 11001:
                        res.status(400).send([{
                            msg: 'Username already taken',
                            param: 'username'
                        }]);
                        break;
                    default:
                        var modelErrors = [];
                        if (err.errors) {
                            for (var x in err.errors) {
                                modelErrors.push({
                                    param: x,
                                    msg: err.errors[x].message,
                                    value: err.errors[x].value
                                });
                            }
                            res.status(400).send(modelErrors);
                        }
                }
                return res.status(400);
            }
            req.logIn(user, function(err) {
                if (err) return next(err);
                var sEvent = {
                    category: 0,
                    code: 'users::create',
                    level: 'info',
                    targetGroup: ['userManagementAdmins'],
                    title: 'User has signed up',
                    link: '/#!/users/' + user.username,
                    initGroup: 'system',
                    extraInfo: {
                        actionName: 'User has signed up in system',
                        clean: user.name + (user.whatDepartment ? '; from department - ' + user.whatDepartment : '')
                    }
                };
                var EventProcessor = require('meanio').events;
                EventProcessor.emit('notification', sEvent);
                res.redirect('/');
            });
            res.status(200);
        });
    } else {
        User
            .findOne({
                _id: req.user._id
            }, {
                roles: 1,
                department: 1
            }, function(err, curUser) {
                if (err) {
                    console.log(err);
                    return res.status(500).send([{
                        msg: err
                    }]);
                } else {
                    if (curUser) {
                        if (curUser.roles.indexOf('admin') !== -1) {
                            user.save(function(err) {
                                if (err) {
                                    console.log(err);
                                    switch (err.code) {
                                        case 11000:
                                            res.status(400).send([{
                                                msg: 'Username already taken',
                                                param: 'username'
                                            }]);
                                            break;
                                        case 11001:
                                            res.status(400).send([{
                                                msg: 'Username already taken',
                                                param: 'username'
                                            }]);
                                            break;
                                        default:
                                            var modelErrors = [];
                                            if (err.errors) {
                                                for (var x in err.errors) {
                                                    modelErrors.push({
                                                        param: x,
                                                        msg: err.errors[x].message,
                                                        value: err.errors[x].value
                                                    });
                                                }
                                                res.status(400).send(modelErrors);
                                            }
                                    }
                                    return res.status(400);
                                } else {
                                    var sEvent = {
                                        category: 0,
                                        code: 'users::create',
                                        level: 'info',
                                        targetGroup: ['admins'],
                                        title: 'User has signed up another user',
                                        link: '/#!/users/' + user.username,
                                        initPerson: req.user._id,
                                        extraInfo: {
                                            actionName: 'registered another user in system',
                                            clean: user.name
                                        }
                                    };
                                    var EventProcessor = require('meanio').events;
                                    EventProcessor.emit('notification', sEvent);
                                    return res.status(200).send();
                                }
                            });
                        } else if (curUser.roles.indexOf('manager') !== -1) {
                            user.department = curUser.department;
                            user.save(function(err) {
                                if (err) {
                                    console.log(err);
                                    switch (err.code) {
                                        case 11000:
                                            res.status(400).send([{
                                                msg: 'Username already taken',
                                                param: 'username'
                                            }]);
                                            break;
                                        case 11001:
                                            res.status(400).send([{
                                                msg: 'Username already taken',
                                                param: 'username'
                                            }]);
                                            break;
                                        default:
                                            var modelErrors = [];
                                            if (err.errors) {
                                                for (var x in err.errors) {
                                                    modelErrors.push({
                                                        param: x,
                                                        msg: err.errors[x].message,
                                                        value: err.errors[x].value
                                                    });
                                                }
                                                res.status(400).send(modelErrors);
                                            }
                                    }
                                    return res.status(400);
                                } else {
                                    var sEvent = {
                                        category: 0,
                                        code: 'users::create',
                                        level: 'info',
                                        targetGroup: ['admins'],
                                        title: 'User has signed up',
                                        link: '/#!/users/' + user.username,
                                        initPerson: req.user._id,
                                        extraInfo: {
                                            actionName: 'registered another user',
                                            clean: user.name + ' in corresponding department'
                                        }
                                    };
                                    var EventProcessor = require('meanio').events;
                                    EventProcessor.emit('notification', sEvent);
                                    return res.status(200).send();
                                }
                            });
                        } else {
                            return res.status(403).send([{
                                msg: 'Access denied'
                            }]);
                        }
                    } else {
                        return res.status(403).send([{
                            msg: 'Authorization is required'
                        }]);
                    }
                }
            });
    }
};
/**
 * Send User
 */
exports.me = function(req, res) {
    res.json(req.user || null);
};

/**
 * Find user by id
 */
exports.user = function(req, res, next, id) {
    User
        .findOne({
            _id: id
        })
        .exec(function(err, user) {
            if (err) return next(err);
            if (!user) return next(new Error('Failed to load User ' + id));
            req.profile = user;
            next();
        });
};

/**
 * Resets the password
 */
exports.resetpassword = function(req, res, next) {
    User.findOne({
        resetPasswordToken: req.params.token,
        resetPasswordExpires: {
            $gt: Date.now()
        }
    }, function(err, user) {
        if (err) {
            console.log(err);
            return res.status(400).json({
                msg: err
            });
        }
        if (!user) {
            console.log('Token invalid or expired');
            return res.status(400).json({
                msg: 'Token invalid or expired'
            });
        }
        req.assert('password', 'Password must be between 8-20 characters long').len(8, 20);
        req.assert('confirmPassword', 'Passwords do not match').equals(req.body.password);
        var errors = req.validationErrors();
        if (!errors)
            errors = [];
        if (passwordStrength(req.body.password) < 50) {
            errors.push({
                params: 'password',
                msg: 'The password must be more difficult',
                value: user.hashed_password
            });
        }

        if (errors && errors.length > 0) {
            console.log(errors);
            return res.status(400).send(errors);
        }
        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        user.save(function(err) {
            req.logIn(user, function(err) {
                if (err) return next(err);
                return res.send({
                    user: user,
                });
            });
        });
    });
};

/**
 * Send reset password email
 */
function sendMail(mailOptions, cb) {
    //console.log(config.mailer);
    var transport = nodemailer.createTransport(config.mailer);
    transport.sendMail(mailOptions, function(err, response) {
        if (err) {
            console.log(err);
            return cb(err);
        } else {
            //console.log(response);
            return cb(null, response);
        }
    });
}

/**
 * Callback for forgot password link
 */
exports.forgotpassword = function(req, res, next) {
    async.waterfall([
            function(done) {
                crypto.randomBytes(20, function(err, buf) {
                    var token = buf.toString('hex');
                    done(err, token);
                });
            },
            function(token, done) {
                User.findOne({
                    $or: [{
                        email: {
                            $regex: new RegExp(req.body.text, 'i')
                        }
                    }, {
                        username: req.body.text
                    }]
                }, function(err, user) {
                    if (err) {
                        done(err);
                    } else {
                        if (user)
                            done(err, user, token);
                        else
                            done('Such user does not exist');
                    }
                });
            },
            function(user, token, done) {
                user.resetPasswordToken = token;
                user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
                user.save(function(err) {
                    done(err, token, user);
                });
            },
            function(token, user, done) {
                var mailOptions = {
                    to: user.email,
                    from: 'ACRM Support Service <support@mapqo.com>'
                };
                mailOptions = templates.forgot_password_email(user, req, token, mailOptions);
                sendMail(mailOptions, function(err, response) {
                    done(err, response);
                });
            }
        ],
        function(err, status) {
            //console.log('err', err, 'status', status);
            var response = {};
            if (err) {
                response.message = err;
                response.status = 'danger';
            } else {
                response.message = 'Mail was successfully sent';
                response.status = 'success';
            }
            var sEvent = {
                category: 0,
                level: 'info',
                targetGroup: ['userManagementAdmins'],
                title: 'User restored the password to system',
                link: '/#!/users',
                initPerson: req.user._id,
                extraInfo: {
                    actionName: 'has been used the service password recovery'
                }
            };
            var EventProcessor = require('meanio').events;
            EventProcessor.emit('notification', sEvent);
            return res.jsonp(response);
        }
    );
};
