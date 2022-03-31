const express = require('express');
const {
    ensureAuthenticated
} = require('../config/authenticate');
const router = express.Router({
    mergeParams: true
});

router.post('/', ensureAuthenticated, (req, res) => {
    
    if (req.body.settings_type == 'profile-setup') {
        res.redirect('/profile');
    } else if (req.body.settings_type == 'cmd-skills') {
        res.redirect('/skills');
    }

});

module.exports = router;