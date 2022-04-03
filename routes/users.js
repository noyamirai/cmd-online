/*eslint no-undef: "error"*/
require('dotenv').config();
const express = require('express');
const router = express.Router();


const { User } = require('../models/schemas');
const multer = require('multer');
// const fs = require('fs');
const { Student } = require('../models/schemas');
const argon2 = require('argon2');
const passport = require('passport');

const CRUD = require(`../controller/crud-operations`);
const nodemailer = require('nodemailer');
const { getMaxListeners } = require('../../Test/test/models/user');
const mailuser = process.env.usermail;
const mailpass = process.env.passmail;



//RENDER PAGES
router.get('/login', (req, res) => { res.render('login'); });
router.get('/register', (req, res) => res.render('register'));

//MULTER
// let storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, '../public/uploads');
//     },
//     filename: (req, file, cb) => {
//         // cb(null, file.fieldname + '-' + Date.now());
//         let ext = ''; // set default extension (if any)
//         if (file.originalname.split(".").length>1) // checking if there is an extension or not.
//             ext = file.originalname.substring(file.originalname.lastIndexOf('.'), file.originalname.length);
//         cb(null, Date.now() + ext);
//     }
// });

// let upload = multer({ storage: storage });

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
    // const obj = {
    //     img: {
    //         data: fs.readFileSync(path.join(__dirname + '/uploads/' + req.file.filename)),
    //         contentType: 'image/png'
    //     }
    // };
    // Student.create(obj, (err, item) => {
    //     if (err) {
    //         console.log(err);
    //         errors.push({msg: 'Could not upload image'}); 
    //     } else {
    //         item.save();
    //     }
    // });

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
                                res.render('login', { msg: 'email had been sent' });
                                res.redirect('/users/login');
                            });
                        }
                        main().catch(console.error);

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

module.exports = router;
