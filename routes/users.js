/*eslint no-undef: "error"*/
require('dotenv').config();
const express = require('express');
const router = express.Router();


const { User } = require('../models/schemas');
const multer = require('multer');
// const fs = require('fs');
const { Student } = require('../models/schemas');
const { Teacher } = require('../models/schemas');
const argon2 = require('argon2');
const passport = require('passport');
// const logout_btn = document.getElementById('logout');
const CRUD = require(`../controller/crud-operations`);
const nodemailer = require('nodemailer');
// const { getMaxListeners } = require('../../Test/test/models/user');
// eslint-disable-next-line no-undef
const mailuser = process.env.usermail;
// eslint-disable-next-line no-undef
const mailpass = process.env.passmail;



//RENDER PAGES
router.get('/login', (req, res) => { 
    res.render('login', {
        bannerTitle: 'Inloggen',
        bannerSubtitle: 'CMD Online'              
    });
});

router.get('/register', (req, res) =>  {
    res.render('register', {
        bannerTitle: 'Registreren',
        bannerSubtitle: 'CMD Online'   
    });
});

const multerStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public');
    },
    filename: (req, file, cb) => {
        const ext = file.mimetype.split('/')[1];
        cb(null, `uploads/${file.fieldname}-${Date.now()}.${ext}`);
    },
});

const upload = multer({
    storage: multerStorage
});

//REGISTER HANDLER
router.post('/register', upload.single('profile_pic'), (req, res) => {
    let { name, username, email, password, password2, type } = req.body;
    let profile_pic = req.file.filename;
    let errors = [];

    //CHECK FIELDS
    if (!name || !username || !email || !password || !password2 || !type) {
        errors.push({ msg: 'Please fill in all fields' });
    }

    //CHECK PASSWORDS
    if (password != password2) {
        errors.push({ msg: 'Please make sure your passwords match' });
    }

    //CHECK PASSWORD LENGTH
    if (password.length < 6) {
        errors.push({ msg: 'Your password needs to be at least 8 characters long' });
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
            type,
            profile_pic
        });
    } else {
        User.findOne({ email: email })
            .then(async user => {
                if (user) {
                    //ACCOUNT ALREADY EXISTS
                    errors.push({ msg: 'This email is already in use' });
                    res.render('./register', {
                        errors,
                        name,
                        username,
                        email,
                        password,
                        password2,
                        type,
                        profile_pic
                    });
                } else {
                    const hash = await argon2.hash(password, { hashLength: 10 });

                    // SET STRING PASSWORD TO HASHED PASSWORD
                    password = hash;

                    CRUD.createDoc(User, {
                        username: username,
                        email: email,
                        password: password,
                        name: name,
                        type: type,
                        profile_pic: profile_pic,
                        is_admin: false
                    }).then((userObject) => {
                        CRUD.createDoc(Student, { user: userObject.id, cmd_skills: { best: null, want_to_learn: [null] }, classes: null, courses: null });
                        async function main() {
                            // Generate test SMTP service account from ethereal.email
                            // Only needed if you don't have a real mail account for testing
                            // create reusable transporter object using the default SMTP transport
                            let transporter = nodemailer.createTransport({
                                service: 'gmail',
                                auth: {
                                    user: mailuser, // generated ethereal user
                                    pass: mailpass, // generated ethereal password
                                },
                                tls: {
                                    rejectUnautorized: false
                                },
                            });


                            let mailoptions = {
                                from: 'Cmd-Online',
                                to: email,
                                subject: 'Cmd-Online',
                                text: 'Regegisteert',
                                html: '<b> Uw registratie bij de cmd-online aplicatie is gelukt <b>',

                            };
                            transporter.sendMail(mailoptions, (error, info) => {
                                if (error) {
                                    return console.log(error),
                                    res.json({
                                        error: error,
                                        message: 'er gaat hier iets fout',
                                    });
                                }
                                console.log('message send: %s', info.messageID);
                                console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
                                res.render('login', { 
                                    msg: 'email had been sent',
                                    bannerTitle: 'Inloggen',
                                    bannerSubtitle: 'CMD Online'
                                });
                                res.redirect('/users/login');
                            });
                        }
                        main().catch(console.error);
                        if (type == 'student') {
                            CRUD.createDoc(Student, { user: userObject.id, cmd_skills: { best: null, want_to_learn: [null] }, classes: { normal: null, elective: null }, courses: null });
                        } else {
                            CRUD.createDoc(Teacher, { user: userObject.id, cmd_skills: { best: null, want_to_learn: [null] }, classes: { normal: null, elective: null }, courses: null });
                        }
                        res.redirect('/users/login');
                    });
                }
            });
    }
});

//LOGIN HANDLER
router.post('/login', (req, res, next) => {
    let errors = [];
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/users/login',
    })(req, res, next);
    errors.push({ msg: 'email not found' });
});

//LOGOUT HANDLER
router.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/users/login');
});
module.exports = router;
