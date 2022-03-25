const express = require('express');
const router = express.Router();

const {User} = require('../models/schemas');
const {Student} = require('../models/schemas');

const argon2 = require ('argon2');
const passport = require('passport');

const CRUD = require(`../controller/crud-operations`);

//RENDER PAGES
router.get('/login', (req, res)=> {res.render('login');});
router.get('/register', (req, res)=> res.render('register'));


//REGISTER HANDLER
router.post('/register', (req, res) =>{
    let { name, username, email, password, password2, type} = req.body;
    let errors = [];

    //CHECK FIELDS
    if (!name || !username || !email || !password || !password2 || !type) {
        errors.push({msg: 'Please fill in all fields'});   
    }

    //CHECK PASSWORDS
    if (password != password2) {
        errors.push({ msg: 'Please make sure your passwords match'});
    }

    //CHECK PASSWORD LENGTH
    if (password.length < 6) {
        errors.push({msg: 'Your password needs to be at least 8 characters long'});
    }
    //RENDER PAGE WITH DATA
    if (errors.length > 0 ) {
        res.render('./register', {
            errors,
            name,
            username,
            email,
            password,
            password2,
            type
        });
    }  else {
        User.findOne({email: email})
            .then( async user => {
                if (user) {
                // ACCOUNT ALREADY EXISTS
                    errors.push({msg: 'This email is already in use'});
                    res.render('./register', {
                        errors,
                        name,
                        username,
                        email,
                        password,
                        password2,
                        type
                    });
                } else {

                    const hash = await argon2.hash(password, {hashLength: 10});

                    // SET STRING PASSWORD TO HASHED PASSWORD
                    password = hash;

                    CRUD.createDoc(User, {
                        username: username,
                        email: email,
                        password: password,
                        name: name,
                        type: type,
                        is_admin: false
                    }).then((userObject) => {
                        CRUD.createDoc(Student, { user: userObject.id, cmd_skills: { best: [null], want_to_learn: [null]}, classes: null, courses: null });
                        res.redirect('/users/login');
                    });
                }
            });
    }
});

//LOGIN HANDLER
router.post('/login', (req, res, next)=> {
    let errors = [];
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/users/login', 
    })(req, res, next);
    errors.push({msg: 'email not found'}); 
});

module.exports= router;
