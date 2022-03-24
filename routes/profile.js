const express = require('express');
const router = express.Router();
//const { User } = require('../models/schemas');
//const argon2 = require('argon2');
//const passport = require('passport');

router.get('/profile', (req, res) => {
    res.render('profile');
    // res.send('stinky');
});

module.exports = router;
