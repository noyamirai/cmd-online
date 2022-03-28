const express = require('express');
const {
    ensureAuthenticated
} = require('../config/authenticate');
const router = express.Router({
    mergeParams: true
});

const schemas = require('../models/schemas');
const CRUD = require(`../controller/crud-operations`);

router.get('/', ensureAuthenticated, (req, res) => {
    CRUD.findDocByQuery(schemas.User, 'username', req.user.username).then((userData) => {

        if (userData.type == 'student') {
            schemas.Student.findOne({
                'user': userData.id
            }).lean().populate({
                path: `user`
            }).exec((err, result) => {
                if (err) Promise.reject(err);

                console.log(result);
                res.render('index', {
                    userData: result,
                    headerClass: 'no-box-shadow'
                });
            });

        } else if (userData.type == 'teacher') {
            schemas.Teacher.findOne({
                'user': userData.id
            }).lean().populate({
                path: `user`
            }).exec((err, result) => {
                if (err) Promise.reject(err);

                res.render('index', {
                    userData: result,
                    headerClass: 'no-box-shadow'
                });
            });
        }
    });
});

module.exports = router;