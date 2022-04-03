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

const team = require(`../controller/team-generator`);

// Course overview
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

//Class details directly after clicking on a course (only students will navigate here)
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
                        res.redirect(`${courseData.linkRef}/${courseClass.linkRef}`);
                    }
                });
            });
        });
    });
});

//Get all classes of specific course (only teachers will navigate here)
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

// Get class details (student overview)
router.get(`/:course/:class`, ensureAuthenticated, (req, res) => {

    CRUD.findDocByQuery(schemas.Course, 'linkRef', req.params.course).then((courseData) => {
        let prevURL;
        let schema;
        let className;
        let formURL;

        const prevURLPath = new URL(req.headers.referer);
        let url = prevURLPath.pathname.split('/');
        const prevPage = url.pop();

        if (req.user.type == 'student') {
            if (prevPage == 'home') {
                prevURL = `/${req.params.username}/${req.params.course}/${req.params.class}/home`;
            } else if (req.params.course == 'class') {
                prevURL = `/`;
            } else {
                prevURL = `/${req.params.username}/courses`;
            }

        } else if (req.user.type == 'teacher') {

            if (prevPage == 'home') {
                prevURL = `/${req.params.username}/${req.params.course}/${req.params.class}/home`;
            } else {
                prevURL = `/${req.params.username}/${req.params.course}/classes`;
            }

            className = 'overflow form--popup';
            formURL = `/teams/create`;
        }


        if (courseData.type != 'normal') {
            schema = schemas.ElectiveClass;
        } else {
            schema = schemas.Class;
        }

        // insert user info based on id      
        schema.findOne({
            'linkRef': req.params.class
        }).lean().populate({
            path: 'teachers',
            populate: {
                path: `user`
            }
        }).populate({
            path: 'students',
            populate: {
                path: 'user'
            }
        }).exec((err, classData) => {
            if (err) Promise.reject(err);

            res.render(`class-details`, {
                prevURL: prevURL,
                formURL: formURL,
                isPopup: true,
                studentData: classData.students,
                userData: req.user,
                bannerTitle: classData.title,
                bannerSubtitle: `${classData.students.length} studenten`,
                linkRef: classData.linkRef,
                classTeams: classData.teams,
                className: className
            });
        });
    });
});


// Team form page (teacher can only get here when JS is disabled)
router.get(`/:course/:class/team-form`, ensureAuthenticated, (req, res) => {
    let schema;

    CRUD.findDocByQuery(schemas.Course, 'linkRef', req.params.course).then((courseData) => {

        if (courseData.type != 'normal') {
            schema = schemas.ElectiveClass;
        } else {
            schema = schemas.Class;
        }

        CRUD.findDocByQuery(schema, 'linkRef', req.params.class).then((classObject) => {

            res.render('team-generation', {
                bannerTitle: classObject.title,
                bannerSubtitle: `${classObject.students.length} studenten`,
                linkRef: classObject.linkRef,
                isPopup: false,
                formURL: `/${req.params.username}/${req.params.course}/${req.params.class}/teams/create`,
                prevURL: `/${req.params.username}/${req.params.course}/${req.params.class}`,
                classTeams: classObject.teams
            });
        });
    });
});

router.post('/:course/:class/teams/create', (req, res) => {
    const teamSize = req.body.teamSize;

    let allStudentObjects = [];
    let allTeams = [];

    CRUD.findDocByQuery(schemas.Course, 'linkRef', req.params.course).then((courseData) => {
        let classSchema;

        if (courseData.type != 'normal') {
            classSchema = schemas.ElectiveClass;
        } else {
            classSchema = schemas.Class;
        }

        // reset
        schemas.Team.remove((err) => {
            if (err) Promise.reject(err);
            console.log(`deleted`);
        });

        classSchema.updateMany({
            linkRef: req.params.class
        }, {
            $set: {
                teams: []
            }
        }, (err, affected) => {
            console.log(`affected`, affected);
        });

        schemas.Student.updateMany({}, {
            $set: {
                teams: []
            }
        }, (err, affected) => {
            console.log(`affected`, affected);
        });

        classSchema.findOne({
            'linkRef': req.params.class
        }).lean().populate({
            path: 'students',
            populate: {
                path: 'user'
            }
        }).exec((err, classData) => {
            if (err) Promise.reject(err);

            allStudentObjects = classData.students;

            team.generate(allStudentObjects, teamSize).then((generatedTeams) => {
                generatedTeams.forEach((team) => {

                    CRUD.createDoc(schemas.Team, {
                        name: team.name,
                        number: team.number,
                        students: team.students,
                        class: classData.id,
                        course: courseData.id
                    }).then((doc) => {

                        // add team id to class teams
                        CRUD.addIdReferenceToDoc(classSchema, classData._id, 'teams', doc._id);

                        doc.students.forEach((object) => {
                            // add team id to teams of each student
                            CRUD.addIdReferenceToDoc(schemas.Student, object.student._id, 'teams', doc._id);
                        });

                        schemas.Team.findById(doc.id).lean().populate({
                            path: `students.student`,
                            select: `user`,
                            populate: {
                                path: `user`,
                                select: `name profile_pic`
                            }
                        }).populate('students.cmd_skill').exec((err, teamData) => {
                            if (err) Promise.reject(err);

                            allTeams.push(teamData);

                            if (allTeams.length === generatedTeams.length) {
                                allTeams.forEach((team) => {
                                    team.students.forEach(member => {
                                        console.log(member.cmd_skill);
                                    });
                                });
                                res.render('team-details', {
                                    allTeams: allTeams.sort((a, b) => parseFloat(a.number) - parseFloat(b.number)),
                                    userData: null,
                                    courseData: null,
                                    memberView: false
                                });
                            }
                        });
                    });
                });
            });
        });
    });
});



// Class home page (only visible if class has teams already)
router.get(`/:course/:class/home`, ensureAuthenticated, (req, res) => {
    let prevURL;
    let schema;

    if (req.user.type == 'student') {
        prevURL = `/${req.params.username}/courses`;
    } else if (req.user.type == 'teacher') {
        prevURL = `/${req.params.username}/${req.params.course}/classes`;
    }

    CRUD.findDocByQuery(schemas.Course, 'linkRef', req.params.course).then((courseData) => {

        if (courseData.type != 'normal') {
            schema = schemas.ElectiveClass;
        } else {
            schema = schemas.Class;
        }

        CRUD.findDocByQuery(schema, `linkRef`, req.params.class).then((classObject) => {

            // insert user info based on id  
            res.render(`class-home`, {
                userData: req.user,
                prevURL: prevURL,
                bannerTitle: classObject.title,
                bannerSubtitle: `${classObject.students.length} studenten`,
                linkRef: `${courseData.linkRef}/${req.params.class}`
            });
        });
    });
});

// Get all teams of specific course class
router.get(`/:course/:class/teams`, ensureAuthenticated, (req, res) => {
    let schema;

    CRUD.findDocByQuery(schemas.Course, 'linkRef', req.params.course).then((courseData) => {
        if (courseData.type != 'normal') {
            schema = schemas.ElectiveClass;
        } else {
            schema = schemas.Class;
        }

        schema.findOne({
            'linkRef': req.params.class
        }).lean().populate({
            path: `teams`,
            select: `name students number`
        }).exec((err, classData) => {
            if (err) Promise.reject(err);
            console.log(classData);

            res.render(`team-overview`, {
                prevURL: `/${req.params.username}/${req.params.course}/${req.params.class}/home`,
                formURL: `/${req.params.username}/${req.params.course}/${req.params.class}/teams/create`,
                userData: null,
                isPopup: true,
                teamData: classData.teams.sort((a, b) => parseFloat(a.number) - parseFloat(b.number)),
                bannerTitle: classData.title,
                bannerSubtitle: `Team overzicht`,
                linkRef: `${req.params.course}/${req.params.class}`
            });
        });
    });
});

module.exports = router;