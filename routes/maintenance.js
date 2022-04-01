const express = require('express');
const router = express.Router({
    mergeParams: true
});

const schemas = require('../models/schemas');
const CRUD = require(`../controller/crud-operations`);
const paramCase = require('param-case');

router.get('/', (req, res) => {
    res.render('./cms/index', {
        bannerTitle: 'CMS',
        bannerSubtitle: 'Overzicht',
        formAction: 'topic'
    });
});

router.post('/topic', (req, res) => {
    if (req.body.cms_option == 'Gebruikers') {

        res.render('./cms/index', {
            bannerTitle: req.body.cms_option,
            bannerSubtitle: `CMS opties`,
            legendTitle: 'Kies een optie',
            selectName: 'user',
            buttonAddLabel: `${req.body.cms_option} aanmaken`,
            buttonDeleteLabel: `${req.body.cms_option} verwijderen`,
            formAction: 'users'
        });

    } else if (req.body.cms_option == 'Vakken') {
        res.render('./cms/index', {
            bannerTitle: req.body.cms_option,
            bannerSubtitle: `CMS opties`,
            legendTitle: 'Kies een optie',
            selectName: 'course',
            buttonAddLabel: `${req.body.cms_option} aanmaken`,
            buttonDeleteLabel: `${req.body.cms_option} verwijderen`,
            formAction: 'courses'
        });
    }
});

router.post('/courses', (req, res) => {


    if (req.body.course_option == 'add') {

        schemas.SchoolYear.find({}).then((allYearData) => {
            schemas.SchoolBloks.find({
                'linkRef': {
                    '$regex': '^((?!internship).)*$',
                    '$options': 'i'
                }
            }).then((allBlokData) => {
                const allTypes = [{
                    title: 'Algemeen vak',
                    linkRef: 'normal'
                },
                {
                    title: 'Keuzeproject',
                    linkRef: 'project'
                },
                {
                    title: 'Keuzeproject vak',
                    linkRef: 'project_class'
                },
                {
                    title: 'Profileringsvak',
                    linkRef: 'elective'
                }
                ];

                res.render('./cms/form', {
                    bannerTitle: 'Vak toevoegen',
                    bannerSubtitle: `Sick!`,
                    formAction: 'courses/add',
                    allYearData: allYearData.sort((a, b) => parseFloat(a.linkRef) - parseFloat(b.linkRef)),
                    allBlokData: allBlokData.sort((a, b) => parseFloat(a.linkRef) - parseFloat(b.linkRef)),
                    allTypesData: allTypes,
                });
            });
        });

    } else if (req.body.course_option == 'delete') {
        // do stuff
    }
});

router.post('/courses/add', (req, res) => {
    let inBloks = [];
    inBloks.push(req.body.in_blok_1);

    if (req.body.in_blok_2) {
        inBloks.push(req.body.in_blok_2);
    }

    schemas.SchoolBloks.find({
        'linkRef': {
            $in: inBloks
        }
    }).then((result) => {
        let blokIds = [];
        result.forEach((blok) => {
            blokIds.push(blok.id);
        });

        CRUD.createDoc(schemas.Course, {
            title: req.body.title,
            linkRef: paramCase.paramCase(req.body.title),
            in_blok: blokIds,
            in_year: req.body.in_year,
            type: req.body.type
        }).then((courseData) => {

            console.log(courseData);

            schemas.SchoolBloks.find({ '_id': { $in: courseData.in_blok }}).then((foundBloks) => {
                foundBloks.forEach((blok) => {
                    blok.courses.push(courseData);
                    blok.save();
                });
            });

            schemas.SchoolYear.findOne({ 'linkRef': courseData.in_year}).then((foundYear) => {
                foundYear.courses.push(courseData);
                foundYear.save();
            });

            res.send('course aangemaakt');
        });
    });
});

module.exports = router;