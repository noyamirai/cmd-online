/* eslint-disable no-undef */
const express = require('express');
const router = express.Router({
    mergeParams: true
});
const CRUD = require(`../controller/crud-operations`);
const {
    ensureAuthenticated
} = require('../config/authenticate');
const schemas = require('../models/schemas');

let savedInfo = {};

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
    savedInfo.school_year = req.body.school_year;

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

    // update userobject based on type
    CRUD.findDocByQuery(schemas.Class, 'linkRef', req.body.main_class).then((classObject) => {
        savedInfo.main_class = classObject.id;
        savedInfo.main_class_courses = classObject.courses;
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
            formAction: 'elective'
        });
    });
});

// Fourth question: Ask for elective courses if they selected elective bloks (3 or 4)
router.post('/:username/elective', ensureAuthenticated, (req, res) => {
    savedInfo.in_block = req.body.in_block;

    const inBlok = req.body.in_block;
    const blockType = inBlok.substring(inBlok.indexOf('_') + 1);

    let projectData = [];

    schemas.SchoolBloks.findOne({
        'linkRef': inBlok
    }).lean().populate({
        path: `courses`
    }).exec((err, blokData) => {
        if (err) Promise.reject(err);

        blokData.courses.forEach(element => {
            if (element.type == 'project') {
                projectData.push(element);
            }
        });

        if (blockType == 'elective') {

            res.render(`profile`, {
                username: req.params.username,
                selectData: projectData,
                selectName: 'block_project',
                legendTitle: 'Welk keuzeproject volg je?',
                multipleSelects: false,
                bannerTitle: 'CMD Online',
                bannerSubtitle: 'Keuzeproject selecteren',
                formAction: 'elective-class'
            });
        } else {
            console.log(savedInfo);
            res.redirect('/');
        }
    });
});

// Fifth question: Ask for elective class
router.post('/:username/elective-class', ensureAuthenticated, (req, res) => {

    
    CRUD.findDocByQuery(schemas.Course, 'linkRef', req.body.block_project).then((result) => {
        savedInfo.block_project = result.id;
        savedInfo.block_project_courses = result.accompanying_courses;
    });

    schemas.Course.findOne({
        'linkRef': req.body.block_project
    }).lean().populate({
        path: 'classes.elective'
    }).exec((err, courseData) => {
        if (err) Promise.reject(err);

        res.render(`profile`, {
            username: req.params.username,
            selectData: courseData.classes.elective,
            selectName: 'block_project_class',
            legendTitle: `In welke ${courseData.title} zit je?`,
            multipleSelects: false,
            bannerTitle: 'CMD Online',
            bannerSubtitle: 'Klas selecteren',
            formAction: 'extra-elective'
        });
    });
});

router.post('/:username/extra-elective', ensureAuthenticated, (req, res) => {

    CRUD.findDocByQuery(schemas.ElectiveClass, 'linkRef', req.body.block_project_class).then((result) => {
        savedInfo.block_project_class = result.id;
    });

    const inBlok = savedInfo.in_block;

    let electiveData = [];

    schemas.SchoolBloks.findOne({
        'linkRef': inBlok
    }).lean().populate({
        path: `courses`
    }).exec((err, blokData) => {
        if (err) Promise.reject(err);

        blokData.courses.forEach(element => {
            if (element.type == 'elective') {
                electiveData.push(element);
            }
        });

        res.render(`profile`, {
            username: req.params.username,
            selectData: electiveData,
            selectName: 'block_elective',
            legendTitle: 'Welk extra vak heb je?',
            multipleSelects: false,
            bannerTitle: 'CMD Online',
            bannerSubtitle: 'Keuzevak selecteren',
            formAction: 'done'
        });
    });
});

router.post('/:username/done', ensureAuthenticated, (req, res) => {

    CRUD.findDocByQuery(schemas.Course, 'linkRef', req.body.block_elective).then((result) => {
        savedInfo.block_elective = result.id;

        result.classes.elective.forEach(item => {
            console.log(item);
            savedInfo.block_elective_class = item;
        });

        CRUD.findDocByQuery(schemas.User, 'username', req.params.username).then((userObject) => {

            console.log(savedInfo);
            let allClasses = [];
            let allCourses = [];

            allClasses.push(savedInfo.main_class, savedInfo.block_project_class, savedInfo.block_elective_class);
        
            savedInfo.main_class_courses.forEach(item => {
                allCourses.push(item);
            });

            savedInfo.block_project_courses.forEach(item => {
                allCourses.push(item);
            });
        
            allCourses.push(savedInfo.block_project, savedInfo.block_elective);

            schemas.Student.findOneAndUpdate({
                'user': userObject.id
            }, {
                classes: allClasses,
                courses: allCourses,
            }).then( console.log('USER UPDATED') );

        });

        res.redirect('/');
    });
});

module.exports = router;