/* eslint-disable no-undef */
const express = require('express');
const router = express.Router({
    mergeParams: true
});
// const CRUD = require(`../controller/crud-operations`);
const {
    ensureAuthenticated
} = require('../config/authenticate');
const schemas = require('../models/schemas');

let allProfileOptions = [];

// First question: Ask for school year
router.get('/:username', ensureAuthenticated, (req, res) => {
    schemas.SchoolYear.find({}).lean().populate({
        path: `classes courses`,
        select: 'title linkRef'
    }).exec((err, allSchoolYears) => {
        if (err) Promise.reject(err);

        res.render(`profile`, {
            username: req.params.username,
            legendTitle: 'In welk leerjaar zit je?',
            selectName: 'school_year',
            selectData: allSchoolYears.sort((a, b) => parseFloat(a.linkRef) - parseFloat(b.linkRef)),
            multipleSelects: false,
            bannerTitle: 'CMD Online',
            bannerSubtitle: 'Leerjaar selecteren',
            formAction: 'main-class'
        });
    });
});

// Second question: Ask for their main class
router.post('/:username/main-class', ensureAuthenticated, (req, res) => {
    allProfileOptions.push({
        school_year: req.body.school_year
    });

    schemas.SchoolYear.findOne({
        'slug': req.body.school_year
    }).lean().populate({
        path: `classes courses`,
        select: 'title linkRef'
    }).exec((err, schoolYearData) => {
        if (err) Promise.reject(err);

        res.render(`profile`, {
            username: req.params.username,
            legendTitle: 'In welke hoofdklas zit je?',
            selectName: 'main_class',
            selectData: schoolYearData.classes,
            multipleSelects: false,
            bannerTitle: 'CMD Online',
            bannerSubtitle: 'Hoofdklas selecteren',
            formAction: 'current-block'
        });
    });
});

// Third question: Ask for their current blok
router.post('/:username/current-block', ensureAuthenticated, (req, res) => {
    allProfileOptions.push({
        main_class: req.body.main_class
    });

    schemas.SchoolBloks.find({}).then((allBloks) => {

        res.render(`profile`, {
            username: req.params.username,
            legendTitle: 'Wat is je houdige blok?',
            selectName: 'in_block',
            selectData: allBloks,
            multipleSelects: false,
            bannerTitle: 'CMD Online',
            bannerSubtitle: 'Blok selecteren',
            formAction: 'final'
        });
    });
});

// Fourth question: Ask for elective courses if they selected elective bloks (3 or 4)
router.post('/:username/final', ensureAuthenticated, (req, res) => {
    allProfileOptions.push({
        in_block: req.body.in_block
    });

    const inBlok = req.body.in_block;
    const blockType = inBlok.substring(inBlok.indexOf('_') + 1);
    let projectData = [];
    let electiveData = [];

    schemas.SchoolBloks.findOne({
        'linkRef': inBlok
    }).lean().populate({
        path: `courses`
    }).exec((err, blokData) => {
        if (err) Promise.reject(err);

        blokData.courses.forEach(element => {
            if (element.type == 'project') {
                projectData.push(element);
            } else if (element.type == 'elective') {
                electiveData.push(element);
            }
        });

        const selectData = [{
            data: projectData,
            selectName: 'block_project',
            legendTitle: 'Welk keuzeproject volg je?'
        },
        {
            data: electiveData,
            selectName: 'block_elective',
            legendTitle: 'Welk extra vak heb je?'
        }
        ];

        if (blockType == 'elective') {

            res.render(`profile`, {
                username: req.params.username,
                selectData: selectData,
                multipleSelects: true,
                bannerTitle: 'CMD Online',
                bannerSubtitle: 'Keuzevakken selecteren',
                formAction: 'done'
            });
        } else {
            console.log(allProfileOptions);
            res.send('DONE');
        }
    });
});

router.post('/:username/done', ensureAuthenticated, (req, res) => {
    if (req.body.block_project && req.body.block_elective) {
        allProfileOptions.push({
            block_project: req.body.block_project,
        },
        {
            block_elective: req.body.block_elective
        });
        console.log(allProfileOptions);
    }
    
    res.send('pog ur done!');

});

module.exports = router;