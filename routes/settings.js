const express = require('express');
const {
    ensureAuthenticated
} = require('../config/authenticate');
const router = express.Router({
    mergeParams: true
});

router.post('/', ensureAuthenticated, (req, res) => {
    
    if (req.body.settings_type == 'profile-setup' && req.user.type == 'student') {
        res.redirect('/profile');
    } else if (req.body.settings_type == 'profile-setup' && req.user.type == 'teacher') {
        res.redirect('/profile/teacher');
    } else if (req.body.settings_type == 'cmd-skills') {
        res.redirect('/skills');
    } else if (req.body.settings_type == 'cms') {
        res.redirect('/maintenance');
    } else if (req.body.settings_type == 'account-details') {
        res.redirect('/account');
    }

});

module.exports = router;