const express = require('express');
const router = express.Router({
    mergeParams: true
});
const {
    ensureAuthenticated
} = require('../config/authenticate');
const schemas = require('../models/schemas');
const CRUD = require(`../controller/crud-operations`);

const acronymGen = require(`../public/js/acronym-generator`);

router.get(`/courses`, ensureAuthenticated, (req, res) => {
    CRUD.findDocByQuery(schemas.User, `username`, req.params.username).then((userData) => {

        if (userData.type == 'student') {

            schemas.Student.findOne({
                'user': userData.id
            }).lean().populate(`user courses`).exec(function(err, studentData) {
                if (err) Promise.reject(err);

                const courseData = studentData.courses;

                courseData.forEach(doc => {
                    doc.acronym = acronymGen.createAcronym(doc.title);
                });

                res.render(`courses-overview`, {
                    userData: studentData,
                    courseData: courseData,
                    prevURL: '/'
                });
            });

        } else if (userData.type == 'teacher') {

            schemas.Teacher.findOne({
                'user': userData.id
            }).lean().populate('user').exec((err, teacherData) => {
                if (err) Promise.reject(err);

                if (teacherData.courses != null) {
                    schemas.TeacherCourse.find({
                        'userId': teacherData._id
                    }).lean().populate(`course`).exec(function(err, courseData) {
                        if (err) Promise.reject(err);

                        courseData.forEach(doc => {
                            doc.acronym = acronymGen.createAcronym(doc.course.title);
                        });

                        res.render(`courses-overview`, {
                            userData: teacherData,
                            courseData: courseData
                        });
                    });
                } else {
                    res.render(`courses-overview`, {
                        userData: teacherData,
                        courseData: null
                    });
                }
            });
        }
    });
});

// Only students will navigate here
router.get('/:course', ensureAuthenticated, (req, res) => {
    CRUD.findDocByQuery(schemas.User, 'username', req.params.username).then((userData) => {

        schemas.Course.findOne({
            'linkRef': req.params.course
        }).lean().populate({
            path: 'classes.normal',
            select: 'title students linkRef',
            populate: {
                path: 'students',
                select: 'user',
                populate: {
                    path: 'user'
                }
            }
        }).populate({
            path: 'classes.elective',
            select: 'title students linkRef',
            populate: {
                path: 'students',
                select: 'user',
                populate: {
                    path: 'user'
                }
            }
        }).then((courseData) => {

            let allCourseClasses;

            if (courseData.type != 'normal') {
                allCourseClasses = courseData.classes.elective;
            } else {
                allCourseClasses = courseData.classes.normal;
            }

            schemas.Student.findOne({
                'user': userData.id
            }).then((student) => {
                const allClasses = student.classes.elective;

                allCourseClasses.forEach((courseClass) => {
                    if (allClasses.includes(courseClass._id)) {
                        res.redirect(`${courseData.linkRef}/${courseClass.linkRef}_elective`);
                    }
                });
            });
        });
    });
});

// Only teachers will navigate here
router.get(`/:course/classes`, ensureAuthenticated, (req, res) => {
    CRUD.findDocByQuery(schemas.Course, `linkRef`, req.params.course).then((paramCourse) => {
        CRUD.findDocByQuery(schemas.Teacher, `user`, req.user.id).then((user) => {

            schemas.TeacherCourse.find({
                'userId': user.id
            }).then((allTeacherCourses) => {

                allTeacherCourses.forEach((teacherCourse) => {
                    if (teacherCourse.course == paramCourse.id) {

                        if (paramCourse.type != 'normal') {

                            schemas.ElectiveClass.find({
                                '_id': {
                                    $in: teacherCourse.classes
                                }
                            }).then((classData) => {
                                res.render(`classes-overview`, {
                                    prevURL: `/${req.params.username}/courses`,
                                    bannerTitle: paramCourse.title,
                                    bannerSubtitle: `Klassenoverzicht`,
                                    classData: classData
                                });
                            });

                        } else {
                            schemas.Class.find({
                                '_id': {
                                    $in: teacherCourse.classes
                                }
                            }).then((classData) => {
                                res.render(`classes-overview`, {
                                    prevURL: `/${req.params.username}/courses`,
                                    bannerTitle: paramCourse.title,
                                    bannerSubtitle: `Klassenoverzicht`,
                                    classData: classData
                                });
                            });
                        }
                    }
                });
            });
        });
    });
});

/**
 * TODO: confirm whether or not user sees "/:class/home" when a class has teams already
 */
router.get(`/:course/:class`, ensureAuthenticated, (req, res) => {
    const classType = req.params.class.substring(req.params.class.indexOf('_') + 1);
    const classLink = req.params.class.split('_')[0];

    CRUD.findDocByQuery(schemas.User, 'username', req.params.username).then((userData) => {
        let prevURL;
        let userType;
        let schema;
        let className;
        let formURL;

        if (userData.type == 'student') {
            if (req.params.course == 'class') {
                prevURL = `/`;
            } else {
                prevURL = `/${req.params.username}/courses`;
            }

            userType = 'students';
        } else if (userData.type == 'teacher') {
            prevURL = `/${req.params.username}/${req.params.course}/classes`;
            userType = 'teachers';
            className = 'overflow form--popup';
            formURL = `${req.path}/teams/team-generation`;
        }

        if (classType != 'normal') {
            schema = schemas.ElectiveClass;
        } else {
            schema = schemas.Class;
        }

        // insert user info based on id      
        schema.findOne({
            'linkRef': classLink
        }).lean().populate({
            path: userType,
            populate: {
                path: `user`
            }
        }).exec((err, classData) => {
            if (err) Promise.reject(err);

            res.render(`class-details`, {
                prevURL: prevURL,
                formURL: formURL,
                userData: classData.students,
                bannerTitle: classData.title,
                bannerSubtitle: `${classData.students.length} studenten`,
                linkRef: classData.linkRef,
                classTeams: classData.teams,
                className: className
            });
        });
    });
});

module.exports = router;