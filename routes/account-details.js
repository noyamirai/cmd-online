/* eslint-disable no-unused-vars */
require('dotenv').config();
const express = require('express');
const router = express.Router();
const {
    ensureAuthenticated
} = require('../config/authenticate');
const {
    User
} = require('../models/schemas');
const argon2 = require('argon2');

router.get('/', ensureAuthenticated, (req, res) => {
    res.render('account', {
        bannerTitle: 'Account details',
        bannerSubtitle: 'Mijn account',
        name: req.user.name,
        username: req.user.username,
        profile_pic: req.user.profile_pic
    });
});

router.post('/update', async function(req, res) {
    // let password = req.body.password;
    User.findOneAndUpdate({
        name: req.user.name
    }, {
        name: req.body.name
    }, {
        new: true
    }, (err, data) => {
        if (err) {
            console.log(err);
        } else {
            console.log('name succesfully updated');
        }
    });

    User.findOneAndUpdate({
        username: req.user.username
    }, {
        username: req.body.username
    }, {
        new: true
    }, (err, data) => {
        if (err) {
            console.log(err);
        } else {
            console.log('username succesfully updated');
        }
    });

    let errors = [];
    // let password = req.body.password;

    // if (password.length < 6) {
    //     errors.push({
    //         msg: 'Your password needs to be at least 8 characters long'
    //     });
    // } else {

    //     const hash = await argon2.hash(password, {
    //         hashLength: 10
    //     });
    //     password = hash;

    //     User.findOneAndUpdate({
    //         password: req.user.password
    //     }, {
    //         password: password
    //     }, {
    //         new: true
    //     }, (err, data) => {
    //         if (err) {
    //             console.log(err);
    //         } else {
    //             console.log('password succesfully updated');
    //             res.redirect('/');
    //         }
    //     });
    // }
});
module.exports = router;