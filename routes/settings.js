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
    }

});

module.exports = router;