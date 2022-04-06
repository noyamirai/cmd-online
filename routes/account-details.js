/* eslint-disable no-unused-vars */
require('dotenv').config();
const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../config/authenticate');
const { User } = require('../models/schemas');
const argon2 = require('argon2');

router.get('/', ensureAuthenticated, (req, res) => {
    res.render('account', {
        bannerTitle: 'Account details',
        bannerSubtitle: 'Mijn account',
        name: req.user.name,
        username: req.user.username,
        password: req.user.password,
        profile_pic: req.user.profile_pic
    });
});

router.post('/update', async function (req, res) {
    // let password = req.body.password;
    User.findOneAndUpdate({ name: req.user.name }, { name: req.body.name }, { new: true }, (err, data) => {
        if (err) {
            console.log(err);
        }
        else {
            console.log('name succesfully updated');
            //   req.flash('success', 'User has been updated successfully!');
            //   res.redirect('/');
        }
    });
    User.findOneAndUpdate({ username: req.user.username }, { username: req.body.username }, { new: true }, (err, data) => {
        if (err) {
            console.log(err);
        }
        else {
            console.log('username succesfully updated');
            //   req.flash('success', 'User has been updated successfully!');
            //   res.redirect('/');
        }
    });
    let errors = [];
    let password = req.body.password;
    console.log(password);
    if (password.length < 6) {
        errors.push({ msg: 'Your password needs to be at least 8 characters long' });
    } else {
        // eslint-disable-next-line no-unused-vars
        // eslint-disable-next-line no-inner-declarations

        const hash = await argon2.hash(password, { hashLength: 10 });
        password = hash;
        User.findOneAndUpdate({ password: req.user.password }, { password: password }, { new: true }, (err, data) => {
            if (err) {
                console.log(err);
            }
            else {
                console.log('username succesfully updated');
                //   req.flash('success', 'User has been updated successfully!');
                //   res.redirect('/');
                res.redirect('/account');
            }
        });
    }
});
module.exports = router;