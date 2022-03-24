const express = require('express');
const router = express.Router();
const { User } = require('../models/schemas');
const argon2 = require('argon2');
const passport = require('passport');

//RENDER PAGES
router.get('/login', (req, res) => { res.render('login') });
router.get('/register', (req, res) => res.render('register'));


//REGISTER HANDLER
router.post('/register', (req, res) => {
    const { name, username, email, password, password2, type } = req.body
    let errors = [];

    //CHECK FIELDS
    if (!name || !username || !email || !password || !password2 || !type) {
        errors.push({ msg: 'Please fill in all fields' })
    }

    //CHECK PASSWORDS
    if (password != password2) {
        errors.push({ msg: 'Please make sure your passwords match' })
    }

    //CHECK PASSWORD LENGTH
    if (password.length < 6) {
        errors.push({ msg: 'Your password needs to be at least 8 characters long' })
    }
    //RENDER PAGE WITH DATA
    if (errors.length > 0) {
        res.render('./register', {
            errors,
            name,
            username,
            email,
            password,
            password2,
            type
        })
    } else {
        User.findOne({ email: email })
            .then(async user => {
                if (user) {
                    // ACCOUNT ALREADY EXISTS
                    errors.push({ msg: 'This email is already in use' })
                    res.render('./register', {
                        errors,
                        name,
                        username,
                        email,
                        password,
                        password2,
                        type
                    })
                } else {
                    const newUser = new User({
                        name,
                        username,
                        email,
                        password,
                        type
                    })
                    console.log(req.body)
                    try {
                        const hash = await argon2.hash(newUser.password, { hashLength: 10 });
                        // SET STRING PASSWORD TO HASHED PASSWORD
                        newUser.password = hash
                        newUser.save()
                            .then(user => {
                                res.redirect('/users/login')
                            })
                            .catch()
                    } catch (err) {
                        throw err
                    }
                }
            })
    }

})

//LOGIN HANDLER
router.post('/login', (req, res, next) => {
    let errors = [];
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/users/login',
    })(req, res, next)
    errors.push({ msg: 'email not found' })
});

module.exports = router;