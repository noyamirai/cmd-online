const express = require('express');
const router = express.Router({ mergeParams: true });
const {ensureAuthenticated} = require('../config/authenticate');
const schemas = require('../models/schemas');
const CRUD = require(`../controller/crud-operations`);

const acronymGen = require(`../public/js/acronym-generator`);

router.get(`/courses`, ensureAuthenticated, (req, res) => {
    CRUD.findDocByQuery(schemas.User, `username`, req.params.username).then((userData) => {
        schemas.TeacherCourse.find({
            'userId': userData.id
        }).lean().populate(`course`).exec(function(err, courseData) {
            if (err) Promise.reject(err);

            courseData.forEach(doc => {
                doc.acronym = acronymGen.createAcronym(doc.course.title);
            });

            res.render(`courses-overview`, {
                profile_pic: userData.profile_pic,
                userName: `${userData.name.first} ${userData.name.last}`,
                courseData: courseData,
                headerClass: ''
            });
        });
    });
});

router.get(`/:course/classes`, ensureAuthenticated,(req, res) => {
   
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
router.get(`/:course/:class`, ensureAuthenticated,(req, res) => {
    // get class object
    CRUD.findDocByQuery(schemas.Class, `linkRef`, req.params.class).then((classObject) => {

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
});

module.exports = router;