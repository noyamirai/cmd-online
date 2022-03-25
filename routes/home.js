const express = require('express');
const {ensureAuthenticated} = require('../config/authenticate');
const router = express.Router();

router.get('/', ensureAuthenticated,(req, res) =>{
    const baseURL = req.path;

    res.render('index', { baseURL: baseURL});
});

module.exports = router;