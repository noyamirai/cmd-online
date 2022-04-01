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
    console.log('hi');

    CRUD.findDocByQuery(schemas.User, 'username', req.user.username).then((userData) => {
        if (userData.type == 'student') {
            schemas.Student.findOne({
                'user': userData.id
            }).lean().populate({
                path: `user classes.normal`
            }).exec((err, result) => {
                if (err) Promise.reject(err);

                if (result.cmd_skills.best == null) {
                    res.render('index', {
                        userData: result,
                        userSkill: null,
                    });
                } else {

                    CRUD.findDocByQuery(schemas.cmdSkill, '_id', result.cmd_skills.best).then((skill) => {
                        res.render('index', {
                            userData: result,
                            userSkill: skill,
                        });
                    });
                }
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
                    userSkill: null,
                    headerClass: 'no-box-shadow'
                });
            });
        }
    });
});

module.exports = router;