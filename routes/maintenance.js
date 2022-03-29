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
            schemas.SchoolBloks.find({}).then((allBlokData) => {

                const allTypes = [
                    { 
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
    console.log('?');
    let inBloks = [];
    inBloks.push(req.body.in_blok_1);
    inBloks.push(req.body.in_blok_2);

    schemas.SchoolBloks.find({
        'linkRef': { 
            $in: inBloks 
        }
    }).then((result) => {
        console.log(result);
        res.send('check');
    });

    // CRUD.createDoc(schemas.Course, {
    //     title: req.body.title,
    //     linkRef: paramCase.paramCase(req.body.title),
    //     in_blok: ['6241abeb7922cfeee8b07983', '6241abeb7922cfeee8b07984'],
    //     in_year: req.body.in_year,
    //     type: req.body.type 
    // }).then((result) => {
    //     console.log(result);
    //     res.send('course aangemaakt');
    // });
});






module.exports = router;