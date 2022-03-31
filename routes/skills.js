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
    schemas.cmdSkill.find({}).then((allSkills) => {
        res.render('skills', {
            legendTitle: 'Wat is je beste CMD skill?',
            selectName: 'cmd_skill',
            selectData: allSkills,
            multipleSelects: false,
            bannerTitle: 'CMD skills',
            bannerSubtitle: 'sick',
            formAction: 'submit'
        });
    });
});

router.post('/submit', ensureAuthenticated, (req, res) => {
    

    CRUD.findDocByQuery(schemas.cmdSkill, 'linkRef', req.body.cmd_skill).then((newSkill) => {
        console.log(newSkill.id);

        schemas.Student.findOneAndUpdate({ 
            'user': req.user.id
        }, {
            'cmd_skills': {
                'best': newSkill._id
            }
        }, {
            returnNewDocument: true
        }).then(() => {
            
            res.redirect('/');
        });
    });
});

module.exports = router;