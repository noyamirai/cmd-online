const express = require('express');
const router = express.Router({
    mergeParams: true
});

const schemas = require('../models/schemas');
const CRUD = require(`../controller/crud-operations`);
const paramCase = require('param-case');

// CMS index
router.get('/', (req, res) => {
    res.render('./cms/index', {
        bannerTitle: 'CMS',
        bannerSubtitle: 'Overzicht',
        formAction: 'topic'
    });
});

// Show available CRUD options based on which button was clicked on index
router.post('/topic', (req, res) => {
    if (req.body.cms_option == 'Klassen') {

        res.render('./cms/index', {
            bannerTitle: 'Type klas',
            bannerSubtitle: `CMS opties`,
            legendTitle: 'Om wat voor soort klas gaat het?',
            selectName: 'class_type',
            buttonAddLabel: `Hoofdklas`,
            buttonDeleteLabel: `Project/Keuze klas`,
            formAction: 'classes'
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

// CRUD operations for courses
router.post('/courses', (req, res) => {

    // Based on selected CRUD option (add/delete), perform operations
    if (req.body.course_option == 'add') {

        // Get all school years and blok data (without internship bloks)
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
                    course: true
                });
            });
        });

    } else if (req.body.course_option == 'delete') {

        // On delete, get overview of all courses
        schemas.Course.find({}).then((allCourses) => {

            res.render('./cms/overview', {
                bannerTitle: 'Vak verwijderen',
                bannerSubtitle: `Spannend!`,
                formAction: 'courses/delete',
                courseData: allCourses,
                topic: 'vakken',
                course: true
            });
        });
    }
});

// Adding course to database
router.post('/courses/add', (req, res) => {
    let inBloks = [];
    inBloks.push(req.body.in_blok_1);

    if (req.body.in_blok_2) {
        inBloks.push(req.body.in_blok_2);
    }

    // Get all selected bloks from form
    schemas.SchoolBloks.find({
        'linkRef': {
            $in: inBloks
        }
    }).then((result) => {
        let blokIds = [];
        result.forEach((blok) => {
            blokIds.push(blok.id);
        });

        // Create new course with data from form
        CRUD.createDoc(schemas.Course, {
            title: req.body.title,
            linkRef: paramCase.paramCase(req.body.title),
            in_blok: blokIds,
            in_year: req.body.in_year,
            type: req.body.type
        }).then((courseData) => {

            // Update relevant collections with course id
            schemas.SchoolBloks.find({
                '_id': {
                    $in: courseData.in_blok
                }
            }).then((foundBloks) => {
                foundBloks.forEach((blok) => {
                    blok.courses.push(courseData);
                    blok.save();
                });
            });

            schemas.SchoolYear.findOne({
                'linkRef': courseData.in_year
            }).then((foundYear) => {
                foundYear.courses.push(courseData);
                foundYear.save();
            });

            res.redirect(`${courseData.linkRef}/done`);
        });
    });
});

// Deleting a course
router.post('/courses/delete', (req, res) => {
    const coursesToDelete = req.body.coursesToDelete;
    console.log(coursesToDelete);

    // If multiple courses selected, then perform CRUD for each selected course
    if (Array.isArray(coursesToDelete)) {
        schemas.Course.find({
            'linkRef': {
                $in: coursesToDelete
            }
        }).then((courses) => {

            courses.forEach((course) => {
                console.log(`deleting course: ${course.id}`);
                CRUD.deleteCourses(course.id, course.type);
            });

            res.redirect(`course/done`);

        });
    
    // Perform CRUD for selected course
    } else {
        CRUD.findDocByQuery(schemas.Course, 'linkRef', coursesToDelete).then((courseData) => {
            console.log(`deleting course: ${courseData.id}`);
            CRUD.deleteCourses(courseData.id, courseData.type).then(() => {
                res.redirect(`${courseData.linkRef}/done`);
            });
        });
    }
});

// Show available CRUD options based on which class type was selected
router.post('/classes', (req, res) => {
    let bannerTitle;

    if (req.body.class_type == 'normal') {
        bannerTitle = 'Hoofdklassen';
    } else {
        bannerTitle = 'Projectklassen';
    }

    res.render('./cms/index', {
        bannerTitle: bannerTitle,
        bannerSubtitle: `CMS opties`,
        legendTitle: 'Kies een optie',
        selectName: 'class',
        buttonAddLabel: `Klas aanmaken`,
        buttonDeleteLabel: `Klas verwijderen`,
        formAction: `classes/${req.body.class_type}/action`
    });
});

// Navigate to correct form based on class type and which cms option was selected
router.post('/classes/:class_type/action', (req, res) => {
    let type;

    if (req.params.class_type != 'normal') {
        type = 'project';
    } else {
        type = 'normal';
    }

    if (req.body.class_option == 'add') {

        // Get all courses that match the type of class
        schemas.Course.find({
            'type': type
        }).then((allCourses) => {

            // Get all school years
            schemas.SchoolYear.find({}).then((allYearData) => {
                res.render('./cms/form', {
                    bannerTitle: 'Klas toevoegen',
                    bannerSubtitle: `Pog`,
                    course: false,
                    type: type,
                    allYearData: allYearData.sort((a, b) => parseFloat(a.linkRef) - parseFloat(b.linkRef)),
                    formAction: `classes/${req.params.class_type}/add`,
                    allCourses: allCourses
                });
            });
        });

    } else if (req.body.class_option == 'delete') {
        const classSchema = CRUD.getClassSchema(req.params.class_type);

        // Get all classes based on class type (schema)
        classSchema.find({}).then((allClasses) => {

            res.render('./cms/overview', {
                bannerTitle: 'Klas verwijderen',
                bannerSubtitle: `Spannend!`,
                formAction: `classes/${req.params.class_type}/delete`,
                classData: allClasses.sort((a, b) => parseFloat(a.linkRef) - parseFloat(b.linkRef)),
                topic: 'klassen',
                course: false
            });
        });
    }
});

// Adding class to correct collection based on type
router.post('/classes/:class_type/add', (req, res) => {

    const classSchema = CRUD.getClassSchema(req.params.class_type);
    let courseType;
    let classType;

    if (req.params.class_type != 'normal') {
        courseType = 'project';
        classType = 'elective';
    } else {
        courseType = 'normal';
        classType = 'normal';
    }

    // Get all courses based on class/course type and selected year
    schemas.Course.find({
        'type': courseType,
        'in_year': req.body.in_year
    }).then((allCourses) => {
        let courseIds = [];

        // In case a course has accompanying courses, add those courses to the class object as well
        allCourses.forEach((course) => {
            if (course.type == 'project') {
                courseIds = course.accompanying_courses;
                courseIds.push(course._id);
            } else {
                courseIds.push(course._id);
            }
        });

        CRUD.createDoc(classSchema, {
            title: req.body.title,
            students: [],
            teachers: [],
            courses: courseIds,
            teams: [],
            linkRef: paramCase.paramCase(req.body.title),
            in_year: req.body.in_year
        }).then((classData) => {

            if (classType == 'normal') {
                // If 'main class' add id to school year
                schemas.SchoolYear.findOne({
                    'linkRef': classData.in_year
                }).then((foundYear) => {
                    foundYear.classes.push(classData);
                    foundYear.save();
                });
            }

            // Update course objects based on which ones were added to class object
            schemas.Course.find({
                '_id': {
                    $in: courseIds
                }
            }).then((foundCourses) => {
                foundCourses.forEach((course) => {
                    // Add to rigth class field
                    if (course.type != 'normal') {
                        course.classes.elective.push(classData._id);
                        course.save();
                    } else {
                        course.classes.normal.push(classData._id);
                        course.save();
                    }
                });

                res.redirect(`done`);
            });
        });
    });
});

// Deleting class based on its type
router.post('/classes/:class_type/delete', (req, res) => {
    const classesToDelete = req.body.classesToDelete;
    const classSchema = CRUD.getClassSchema(req.params.class_type);

    let classType;

    if (req.params.class_type != 'normal') {
        classType = 'elective';
    } else {
        classType = 'normal';
    }

    console.log(classesToDelete);

    // Perform delete CRUD based on type
    if (Array.isArray(classesToDelete)) {

        classSchema.find({
            'linkRef': {
                $in: classesToDelete
            }
        }).then((classData) => {

            classData.forEach((classObject) => {
                console.log(`deleting class: ${classObject.id}`);
                CRUD.deleteClasses(classObject.id, classType);
            });

            res.redirect(`done`);

        });
        
    } else {

        CRUD.findDocByQuery(classSchema, 'linkRef', classesToDelete).then((classData) => {
            console.log(`deleting class: ${classData.id}`);

            CRUD.deleteClasses(classData.id, classType).then(() => {
                res.redirect(`done`);
            });
        });

    }
});

// Confirmation page
router.get('/:type/:item/done', (req, res) => {
    res.render('./cms/confirmation', {
        bannerTitle: 'CMS',
        bannerSubtitle: `Bevestiging`,
    });
});

module.exports = router;