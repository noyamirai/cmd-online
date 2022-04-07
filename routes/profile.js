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
let savedTeacherInfo = {};

// First question: Ask for school year
router.get('/', ensureAuthenticated, (req, res) => {

    // Get all school years from DB
    schemas.SchoolYear.find({}).lean().populate({
        path: `classes courses`,
        select: 'title linkRef'
    }).exec((err, allSchoolYears) => {
        if (err) Promise.reject(err);

        res.render(`profile`, {
            username: req.user.username,
            legendTitle: 'In welk leerjaar zit je?',
            selectName: 'school_year',
            selectData: allSchoolYears.sort((a, b) => parseFloat(a.linkRef) - parseFloat(b.linkRef)),
            multipleSelects: false,
            addExtra: false,
            bannerTitle: 'Huidige leerjaar',
            bannerSubtitle: 'Algemeen: 1/3',
            formAction: 'main-class'
        });
    });
});

// Second question: Ask for their main class
router.post('/main-class', ensureAuthenticated, (req, res) => {
    savedInfo.school_year = req.body.school_year;

    // Get all classes linked to selected school year
    schemas.SchoolYear.findOne({
        'linkRef': req.body.school_year
    }).lean().populate({
        path: `classes courses`,
        select: 'title linkRef'
    }).exec((err, schoolYearData) => {
        if (err) Promise.reject(err);

        res.render(`profile`, {
            username: req.user.username,
            legendTitle: 'In welke klas zit je?',
            selectName: 'main_class',
            selectData: schoolYearData.classes,
            multipleSelects: false,
            addExtra: false,
            bannerTitle: 'Jouw klas',
            bannerSubtitle: 'Algemeen: 2/3',
            formAction: 'current-block'
        });
    });
});

// Third question: Ask for their current blok
router.post('/current-block', ensureAuthenticated, (req, res) => {

    // Find selected class and save the ID
    CRUD.findDocByQuery(schemas.Class, 'linkRef', req.body.main_class).then((classObject) => {
        savedInfo.main_class = classObject.id;
    });

    // Get all school bloks from DB
    schemas.SchoolBloks.find({}).then((allBloks) => {

        res.render(`profile`, {
            username: req.user.username,
            legendTitle: 'In welk blok zit je?',
            selectName: 'in_block',
            selectData: allBloks,
            multipleSelects: false,
            addExtra: false,
            bannerTitle: 'Huidige blok',
            bannerSubtitle: 'Algemeen 3/3',
            formAction: 'elective'
        });
    });
});

// Fourth question: Ask for elective courses if they selected elective bloks (3 or 4)
router.post('/elective', ensureAuthenticated, (req, res) => {
    savedInfo.in_block = req.body.in_block;

    const inBlok = req.body.in_block;
    const blockType = inBlok.substring(inBlok.indexOf('_') + 1);

    let projectData = [];
    let mainCourses = [];

    // Get all courses from selected blok
    schemas.SchoolBloks.findOne({
        'linkRef': inBlok
    }).lean().populate({
        path: `courses`
    }).exec((err, blokData) => {
        if (err) Promise.reject(err);

        // Split courses into two arrays based on their type
        blokData.courses.forEach(course => {
            if (course.type == 'project') {
                projectData.push(course);
            } else if (course.type == 'normal') {
                mainCourses.push(course._id);
            }
        });

        // If user selected an elective blok, then move onto next question
        if (blockType == 'elective') {
            res.render(`profile`, {
                username: req.user.username,
                selectData: projectData,
                selectName: 'block_project',
                legendTitle: 'Welk keuzeproject volg je?',
                multipleSelects: false,
                addExtra: false,
                bannerTitle: 'Jouw keuzeproject',
                bannerSubtitle: 'Keuzeblok: 1/3',
                formAction: 'elective-class'
            });
        } else {

            // Use courses linked to class as 'main courses'
            savedInfo.main_class_courses = mainCourses;

            CRUD.findDocByQuery(schemas.User, 'username', req.user.username).then((userObject) => {

                if (userObject.type == 'student') {
                    CRUD.removeUserFromClassesAndCourses(schemas.Student, userObject.id, 'students').then((result) => {
                        result.classes = null;
                        result.courses = null;

                        CRUD.addUserToClassesAndCourses(schemas.Student, savedInfo, result.user).then((student) => {

                            CRUD.addIdReferenceToDoc(schemas.Course, student.courseData, 'students', student.user.id);
                            CRUD.addIdReferenceToDoc(schemas.Class, savedInfo.main_class, 'students', student.user.id);

                            res.redirect('/');

                        });
                    });
                } else {
                    CRUD.removeUserFromClassesAndCourses(schemas.Teacher, userObject.id, 'teachers').then((result) => {
                        result.courses = null;
                        result.courses = null;

                        CRUD.addUserToClassesAndCourses(schemas.Teacher, savedInfo, result.user).then((teacher) => {

                            CRUD.addIdReferenceToDoc(schemas.Course, teacher.courseData, 'teachers', teacher.user.id);
                            CRUD.addIdReferenceToDoc(schemas.Class, savedInfo.main_class, 'teachers', teacher.user.id);

                            res.redirect('/');

                        });
                    });
                }
            });
        }
    });
});

// Fifth question: Ask for elective class
router.post('/elective-class', ensureAuthenticated, (req, res) => {
    // Save selected project id and its accompanying courses
    CRUD.findDocByQuery(schemas.Course, 'linkRef', req.body.block_project).then((result) => {
        savedInfo.block_project = result.id;
        savedInfo.block_project_courses = result.accompanying_courses;
    });

    // Find the selected block project and all its (elective) classes
    schemas.Course.findOne({
        'linkRef': req.body.block_project
    }).lean().populate({
        path: 'classes.elective'
    }).exec((err, courseData) => {
        if (err) Promise.reject(err);

        res.render(`profile`, {
            username: req.user.username,
            selectData: courseData.classes.elective,
            selectName: 'block_project_class',
            legendTitle: `In welke ${courseData.title} klas zit je?`,
            multipleSelects: false,
            addExtra: false,
            bannerTitle: `Project klas`,
            bannerSubtitle: 'Keuzeblok 2/3',
            formAction: 'extra-elective'
        });
    });
});

// Sixth question: Ask for extra class
router.post('/extra-elective', ensureAuthenticated, (req, res) => {

    // Save selected elective class
    CRUD.findDocByQuery(schemas.ElectiveClass, 'linkRef', req.body.block_project_class).then((result) => {
        savedInfo.block_project_class = result.id;
    });

    const inBlok = savedInfo.in_block;

    // Get all courses from the selected blok where type is 'elective' and not 'project'
    schemas.SchoolBloks.findOne({
        'linkRef': inBlok
    }).lean().populate({
        path: `courses`,
        match: {
            'type': 'elective'
        }
    }).exec((err, blokData) => {
        if (err) Promise.reject(err);

        res.render(`profile`, {
            username: req.user.username,
            selectData: blokData.courses,
            selectName: 'block_elective',
            legendTitle: 'Welk extra vak heb je?',
            multipleSelects: false,
            addExtra: false,
            bannerTitle: 'Extra keuzevakken',
            bannerSubtitle: 'Keuzeblok 3/3',
            formAction: 'done'
        });
    });
});

// Save all info for students
router.post('/done', ensureAuthenticated, (req, res) => {

    // Save selected extra elective course id
    CRUD.findDocByQuery(schemas.Course, 'linkRef', req.body.block_elective).then((result) => {
        savedInfo.block_elective = result.id;

        // Get accompanying classes from selected course
        result.classes.elective.forEach(item => {
            savedInfo.block_elective_class = item;
        });

        CRUD.removeUserFromClassesAndCourses(schemas.Student, req.user.id, 'students').then((result) => {
            result.classes = null;
            result.courses = null;

            CRUD.addStudentToClassesAndCourses(schemas.Student, savedInfo, result.user).then((student) => {

                CRUD.addIdReferenceToDoc(schemas.Course, student.courseData, 'students', student.user.id);
                CRUD.addIdReferenceToDoc(schemas.Class, savedInfo.main_class, 'students', student.user.id);
                CRUD.addIdReferenceToDoc(schemas.ElectiveClass, [savedInfo.block_elective_class, savedInfo.block_project_class], 'students', student.user.id);

                res.redirect('/');
            });
        });
    });
});

// FOR TEACHERS: First question: Ask which course they teach
router.get('/teacher', ensureAuthenticated, (req, res) => {

    // Get all school years from DB
    schemas.Course.find({}).then((allCourses) => {

        res.render(`profile`, {
            legendTitle: 'Welk vak geef je?',
            selectName: 'teacher_course',
            selectData: allCourses,
            multipleSelects: false,
            addExtra: false,
            bannerTitle: 'Vakken',
            bannerSubtitle: 'Algemeen: 1/2',
            formAction: 'teacher/course-classes'
        });
    });
});

// FOR TEACHERS: First question: Ask which course they teach
router.post('/teacher/course-classes', ensureAuthenticated, (req, res) => {

    // Get all classes of selected course
    schemas.Course.findOne({
        'linkRef': req.body.teacher_course
    }).lean().populate('classes.normal').populate('classes.elective').exec((err, courseData) => {
        if (err) Promise.reject(err);

        let selectData;
        savedTeacherInfo.teacher_course = courseData._id;

        if (courseData.type != 'normal') {
            selectData = courseData.classes.elective;
            savedTeacherInfo.course_type = courseData.type;
        } else {
            selectData = courseData.classes.normal;
            savedTeacherInfo.course_type = courseData.type;
        }

        res.render(`profile`, {
            legendTitle: `Welke ${courseData.title} klassen geef je les?`,
            selectName: 'course_classes',
            selectData: selectData,
            multipleSelects: false,
            addExtra: true,
            bannerTitle: 'Klassen',
            bannerSubtitle: 'Algemeen: 2/2',
            formAction: 'teacher/next'
        });
    });
});

router.post('/teacher/next', ensureAuthenticated, (req, res) => {

    if (savedTeacherInfo.course_classes == undefined) {
        savedTeacherInfo.course_classes = [];
    }

    // If teacher wants to add another class that they teach for said course
    if (req.body.button_action == 'add-extra') {

        if (req.body.course_type != 'normal') {
            CRUD.findDocByQuery(schemas.ElectiveClass, 'linkRef', req.body.course_classes).then((result) => {
                savedTeacherInfo.course_classes.push(result._id);
            });
        } else {
            CRUD.findDocByQuery(schemas.Class, 'linkRef', req.body.course_classes).then((result) => {
                savedTeacherInfo.course_classes.push(result._id);
            });
        }

        let selectData;

        schemas.Course.findOne({
            '_id': savedTeacherInfo.teacher_course
        }).lean().populate('classes.elective').populate('classes.normal').exec((err, courseData) => {
            if (err) Promise.reject(err);

            if (courseData.type != 'normal') {
                selectData = courseData.classes.elective;
            } else {
                selectData = courseData.classes.normal;
            }

            res.render(`profile`, {
                legendTitle: `Welke ${courseData.title} klassen geef je les?`,
                selectName: 'course_classes',
                selectData: selectData,
                multipleSelects: false,
                addExtra: true,
                bannerTitle: 'Klassen',
                bannerSubtitle: 'Algemeen: 2/2',
                formAction: 'teacher/next'
            });

        });
    
    // Save data
    } else {
        if (req.body.course_type != 'normal') {
            CRUD.findDocByQuery(schemas.ElectiveClass, 'linkRef', req.body.course_classes).then((result) => {
                savedTeacherInfo.course_classes.push(result._id);

                CRUD.findDocByQuery(schemas.Course, '_id', savedTeacherInfo.teacher_course).then((courseData) => {

                    console.log(savedTeacherInfo);

                    CRUD.addTeacherToClassesAndCourses(schemas.Teacher, savedTeacherInfo, req.user.id).then((teacher) => {

                        CRUD.addIdReferenceToDoc(schemas.Course, courseData.id, 'teachers', teacher.id);
                        CRUD.addIdReferenceToDoc(schemas.ElectiveClass, savedTeacherInfo.course_classes, 'teachers', teacher.id);

                        CRUD.createDoc(schemas.TeacherCourse, {
                            userId: teacher.id,
                            course: courseData.id,
                            classes: savedTeacherInfo.course_classes
                        });

                        res.redirect('/');
                    });
                });
            });
        } else {
            CRUD.findDocByQuery(schemas.Class, 'linkRef', req.body.course_classes).then((result) => {
                savedTeacherInfo.course_classes.push(result._id);

                CRUD.findDocByQuery(schemas.Course, '_id', savedTeacherInfo.teacher_course).then((courseData) => {

                    console.log(savedTeacherInfo);

                    CRUD.addTeacherToClassesAndCourses(schemas.Teacher, savedTeacherInfo, req.user.id).then((teacher) => {

                        CRUD.addIdReferenceToDoc(schemas.Course, courseData.id, 'teachers', teacher.id);
                        CRUD.addIdReferenceToDoc(schemas.Class, savedInfo.course_classes, 'teachers', teacher.id);

                        res.redirect('/');
                    });
                });
            });
        }
    }
});


module.exports = router;