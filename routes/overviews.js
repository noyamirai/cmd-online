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
                    profile_pic: studentData.profile_pic,
                    userData: studentData,
                    courseData: courseData,
                    headerClass: ''
                });
            });

        } else if (userData.type == 'teacher') {
            schemas.TeacherCourse.find({
                'userId': userData.id
            }).lean().populate(`course`).exec(function(err, courseData) {
                if (err) Promise.reject(err);

                courseData.forEach(doc => {
                    doc.acronym = acronymGen.createAcronym(doc.course.title);
                });

                res.render(`courses-overview`, {
                    profile_pic: userData.profile_pic,
                    userData: userData,
                    courseData: courseData,
                    headerClass: ''
                });
            });
        }


    });
});

router.get('/:course', ensureAuthenticated, (req, res) => {
    CRUD.findDocByQuery(schemas.User, 'username', req.params.username).then((user) => {

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

            if (courseData.type != 'normal') {
                const allCourseClasses = courseData.classes.elective;

                schemas.Student.findOne({
                    'user': user.id
                }).then((student) => {
                    const allClasses = student.classes.elective;

                    allCourseClasses.forEach((courseClass) => {
                        if (allClasses.includes(courseClass._id)) {
                            console.log('match!');
                            console.log(courseClass);
                            console.log(`/${courseData.linkRef}/${courseClass.linkRef}`);

                            res.redirect(`${courseData.linkRef}/${courseClass.linkRef}_elective`);

                            // res.render(`class-details`, {
                            //     prevURL: `/${req.params.username}/courses`,
                            //     userData: courseClass.students,
                            //     bannerTitle: courseClass.title,
                            //     bannerSubtitle: `${courseClass.students.length} studenten`,
                            //     linkRef: courseClass.linkRef,
                            //     classTeams: courseClass.teams,
                            //     className: null
                            // });
                        }
                    });
                });

            } else {
                // TODO: for normal classes
                console.log(courseData.classes.normal);
            }
        });

    });
});

router.get(`/:course/classes`, ensureAuthenticated, (req, res) => {

    CRUD.findDocByQuery(schemas.Course, `linkRef`, req.params.course).then((paramCourse) => {

        CRUD.findDocByQuery(schemas.User, `username`, req.params.username).then((user) => {

            schemas.TeacherCourse.find({
                'userId': user.id
            }, (err, allTeacherCourses) => {
                if (err) Promise.reject(err);

                allTeacherCourses.forEach(teacherCourse => {
                    if (teacherCourse.course == paramCourse.id) {

                        schemas.Class.find({
                            '_id': {
                                $in: teacherCourse.classes
                            }
                        }, (err, classData) => {
                            if (err) Promise.reject(err);

                            res.render(`classes-overview`, {
                                prevURL: `/${req.params.username}/courses`,
                                bannerTitle: paramCourse.title,
                                bannerSubtitle: `Klassenoverzicht`,
                                classData: classData
                            });

                        }).lean();
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

    // TODO: CHANGE PREVURL BASED ON USER TYPE
    // * IF STUDENT : NO /CLASSES, ONLY /:COURSE

    if (classType != 'normal') {

        // get class object
        CRUD.findDocByQuery(schemas.ElectiveClass, `linkRef`, classLink).then((classObject) => {

            // insert user info based on id      
            schemas.ElectiveClass.findById(classObject.id).lean().populate({
                path: `students`,
                populate: {
                    path: `user`
                }
            }).exec((err, classData) => {
                if (err) Promise.reject(err);

                res.render(`class-details`, {
                    prevURL: `/${req.params.username}/${req.params.course}/classes`,
                    formURL: `${req.path}/teams/team-generation`,
                    userData: classData.students,
                    bannerTitle: classData.title,
                    bannerSubtitle: `${classData.students.length} studenten`,
                    linkRef: classObject.linkRef,
                    classTeams: classObject.teams,
                    className: `overflow form--popup`
                });
            });
        });
    } else {

        // get class object
        CRUD.findDocByQuery(schemas.Class, `linkRef`, classLink).then((classObject) => {

            // insert user info based on id      
            schemas.Class.findById(classObject.id).lean().populate({
                path: `students`,
                populate: {
                    path: `user`
                }
            }).exec((err, classData) => {
                if (err) Promise.reject(err);

                res.render(`class-details`, {
                    prevURL: `/${req.params.username}/${req.params.course}/classes`,
                    formURL: `${req.path}/teams/team-generation`,
                    userData: classData.students,
                    bannerTitle: classData.title,
                    bannerSubtitle: `${classData.students.length} studenten`,
                    linkRef: classObject.linkRef,
                    classTeams: classObject.teams,
                    className: `overflow form--popup`
                });
            });
        });

    }

});

module.exports = router;