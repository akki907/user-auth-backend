const User = require('../models/user');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const config = require('../config/setting');
const auth = require('./Helper/authenticate');
const sendEmail = require('./Helper/emailVerification');

module.exports = (router) => {

    router.post('/register', (req, res) => {
        if (!req.body.email) {
            res.json({
                success: false,
                message: 'You must provide a e-mail'
            })
        } else if (!req.body.password) {
            res.json({
                success: false,
                message: 'You must provide a password'
            })
        } else if (!validator.isEmail(req.body.email)) {
            res.json({
                success: false,
                message: 'Must be a valid email'
            })
        } else {
            var user = new User(req.body)
            user.save(function (err, user) {
                if (err) {
                    if (err.code == 11000) {
                        return res.json({
                            success: false,
                            message: 'Email already exists.'
                        })
                    } else if (err.errors) {
                        if (err.errors.email) {
                            return res.json({
                                success: false,
                                message: err.errors.email.message
                            })
                        } else if (err.errors.username) {
                            return res.json({
                                success: false,
                                message: err.errors.username.message
                            })
                        } else if (err.errors.password) {
                            return res.json({
                                success: false,
                                message: err.errors.password.message
                            })
                        } else {
                            return res.json({
                                success: false,
                                message: err
                            })
                        }
                    } else {
                        return res.json({
                            success: false,
                            message: 'User could not save.'
                        })
                    }
                } else {
                    sendEmail(req, user)
                    res.json({
                        success: true,
                        message: 'User created'
                    })
                }
            })
        }
    })


    //login api

    router.post('/login', (req, res) => {
        if (!req.body.email) {
            return res.json({
                success: false,
                message: 'Email was not provided'
            })
        } else if (!req.body.password) {
            return res.json({
                success: false,
                message: 'Password was not provided'
            })
        } else if (!validator.isEmail(req.body.email)) {
            res.json({
                success: false,
                message: 'Must be a valid email'
            })
        } else {
            User.findOne({
                email: req.body.email
            }, (err, user) => {
                if (err) return res.json({
                    success: false,
                    message: err
                })
                if (!user) return res.json({
                    success: false,
                    message: 'Email not Found'
                });
                const validPassword = user.comparePassword(req.body.password)
                if (!validPassword) {
                    res.json({
                        success: false,
                        message: 'password Invalid'
                    })
                } else if (!user.isEmailVerified) {
                    res.json({
                        success: false,
                        message: 'Email is not verified'
                    })
                } else {
                    var token = jwt.sign({
                        _id: user._id,
                        email: user.email,
                        isEmailVerified: user.isEmailVerified
                    }, config.secret, {
                        expiresIn: '24h'
                    });
                    res.json({
                        success: true,
                        message: 'Login SuccessFull',
                        token
                    })
                }
            })
        }
    })

    router.get('/emailVerify', (req, res) => {
        if (req.query.id && req.query.email) {
            User.findOne({
                email: req.query.email
            }).then((user) => {
                if (!user) return res.json({
                    success: false,
                    message: 'No user found.'
                })
                if (user.isEmailVerified) return res.json({
                    success: false,
                    message: 'Email is already Verified.'
                })
                if (user.id === req.query.id && !user.isEmailVerified) {
                    user.isEmailVerified = true;
                    user.UpdatedAt = Date.now()
                    user.save(function (err, saved) {
                        if (err) return res.json({
                            success: false,
                            message: err
                        })
                        res.json({
                            success: true,
                            message: 'Email verified.'
                        })
                    })
                } else {
                    res.json({
                        success: false,
                        message: 'Wrong Information'
                    })
                }
            }).catch(err => {
                res.json({
                    success: false,
                    message: err
                })
            })
        }
    })

    router.get('/profile', auth.requireAuth, (req, res) => {
        User.findOne({
                _id: req.user._id
            })
            .select('email')
            .exec(function (err, user) {
                if (err) return res.json({
                    success: false,
                    message: err
                })
                if (!user) return res.json({
                    success: false,
                    message: 'User not Found'
                });
                delete user.password
                res.json({
                    success: true,
                    user: user
                })
            })
    })

    return router;
}