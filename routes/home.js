const express = require('express');
const router = express.Router();

router.get('/', (req, res) =>{
    const baseURL = req.path;

    res.render('index', { baseURL: baseURL});
});

module.exports = router;