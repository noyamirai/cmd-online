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

// Course overview: getting all courses from user object
router.get(`/courses`, ensureAuthenticated, (req, res) => {
    if (req.user.type == 'student') {

        schemas.Student.findOne({
            'user': req.user.id
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

    } else if (req.user.type == 'teacher') {

        schemas.Teacher.findOne({
            'user': req.user.id
        }).lean().populate('user').exec((err, teacherData) => {
            if (err) Promise.reject(err);

            // Teacher's courses are linked to TeacherCourse collection
            if (teacherData.courses != null) {
                schemas.TeacherCourse.find({
                    'userId': teacherData._id
                }).lean().populate(`course`).exec((err, courseData) => {
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

//Class details directly after clicking on 'main' class (only students will navigate here)
router.get('/class/:class', ensureAuthenticated, (req, res) => {
    schemas.Class.findOne({
        'linkRef': req.params.class
    }).lean().populate({
        path: 'students',
        populate: {
            path: 'user'
        }
    }).exec((err, classData) => {
        if (err) Promise.reject(err);

        res.render(`class-details`, {
            prevURL: '/',
            formURL: '',
            isPopup: false,
            studentData: classData.students,
            userData: req.user,
            bannerTitle: classData.title,
            bannerSubtitle: `${classData.students.length} studenten`,
            classTeams: classData.teams,
            className: '',
            classLinkRef: classData.linkRef
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

                        const classSchema = CRUD.getClassSchema(paramCourse.type);

                        classSchema.find({
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
                });
            });
        });
    });
});

// Get class details (student overview)
router.get(`/:course/:class`, ensureAuthenticated, (req, res) => {

    CRUD.findDocByQuery(schemas.Course, 'linkRef', req.params.course).then((courseData) => {
        let prevURL;
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
            formURL = `/${req.params.username}/${req.params.course}/${req.params.class}/teams/create`;
        }

        const classSchema = CRUD.getClassSchema(courseData.type);

        // insert user info based on id      
        classSchema.findOne({
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
                classLinkRef: classData.linkRef,
                userData: req.user,
                bannerTitle: classData.title,
                bannerSubtitle: `${classData.students.length} studenten`,
                classTeams: classData.teams,
                className: className
            });
        });
    });
});


// Team form page (teacher can only get here when JS is disabled)
router.get(`/:course/:class/team-form`, ensureAuthenticated, (req, res) => {

    CRUD.findDocByQuery(schemas.Course, 'linkRef', req.params.course).then((courseData) => {
        const classSchema = CRUD.getClassSchema(courseData.type);

        CRUD.findDocByQuery(classSchema, 'linkRef', req.params.class).then((classObject) => {

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

// Team generation
router.post('/:course/:class/teams/create', (req, res) => {
    const teamSize = req.body.teamSize;

    let allStudentObjects = [];
    let allTeams = [];

    CRUD.findDocByQuery(schemas.Course, 'linkRef', req.params.course).then((courseData) => {
        let classType;

        const classSchema = CRUD.getClassSchema(courseData.type);

        if (courseData.type != 'normal') {
            classType = 'elective';
        } else {
            classType = 'normal';
        }

        classSchema.findOne({
            'linkRef': req.params.class
        }).lean().populate({
            path: 'students',
            populate: {
                path: 'user'
            }
        }).exec((err, classData) => {
            if (err) Promise.reject(err);

            let allStudentIds = [];
            let amountOfStudents = classData.students.length - 1;

            // Only allow team generation when there are enough students in class
            if (amountOfStudents >= 8) {

                allStudentObjects = classData.students;

                allStudentObjects.forEach((student) => {
                    allStudentIds.push(student._id);
                });

                // Removes all teams from relevant collections in order to prevent duplicates when generating new teams
                CRUD.resetTeams(classData.teams, classSchema, classData.linkRef, allStudentIds).then(() => {
                    console.log('DONE! Start generating new teams');

                    team.generate(allStudentObjects, teamSize).then((generatedTeams) => {
                        generatedTeams.forEach((team) => {
                            console.log(team);
                            // Add each team to Team collection
                            CRUD.createDoc(schemas.Team, {
                                name: team.name,
                                number: team.number,
                                students: team.students,
                                class: {
                                    [classType]: classData._id
                                },
                                course: courseData.id
                            }).then((doc) => {

                                // add team id to class teams
                                CRUD.addIdReferenceToDoc(classSchema, classData._id, 'teams', doc._id);

                                doc.students.forEach((object) => {
                                    // add team id to teams of each student
                                    CRUD.addIdReferenceToDoc(schemas.Student, object.student._id, 'teams', doc._id);
                                });

                                // Get all teams and their details
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

                                        res.render('team-details', {
                                            allTeams: allTeams.sort((a, b) => parseFloat(a.number) - parseFloat(b.number)),
                                            userData: null,
                                            courseData: null,
                                            memberView: false,
                                            error: false
                                        });
                                    }
                                });
                            });
                        });
                    });
                });

            } else {
                // When there are not enough students
                let errors = [];
                errors.push({
                    msg: 'Not enough students :('
                });

                res.render('team-details', {
                    allTeams: null,
                    userData: null,
                    courseData: null,
                    memberView: false,
                    error: true
                });
            }
        });
    });
});



// Class home page (only visible if class has teams already)
router.get(`/:course/:class/home`, ensureAuthenticated, (req, res) => {
    let prevURL;

    if (req.user.type == 'student') {
        prevURL = `/${req.params.username}/courses`;
    } else if (req.user.type == 'teacher') {
        prevURL = `/${req.params.username}/${req.params.course}/classes`;
    }

    CRUD.findDocByQuery(schemas.Course, 'linkRef', req.params.course).then((courseData) => {

        const classSchema = CRUD.getClassSchema(courseData.type);

        CRUD.findDocByQuery(classSchema, `linkRef`, req.params.class).then((classObject) => {

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

    CRUD.findDocByQuery(schemas.Course, 'linkRef', req.params.course).then((courseData) => {
        const classSchema = CRUD.getClassSchema(courseData.type);

        classSchema.findOne({
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

// Team overview based on selected team
router.get('/:course/:class/teams/:team_number/overview', (req, res) => {
    let prevURL;

    if (req.user.type == 'student') {
        prevURL = `/`;
    } else if (req.user.type == 'teacher') {
        prevURL = `/${req.params.username}/${req.params.course}/${req.params.class}/teams`;
    }

    schemas.Team.findOne({
        'number': req.params.team_number
    }).lean().populate({
        path: `students.student`,
        select: `user`,
        populate: {
            path: `user`,
            select: `name profile_pic`
        }
    }).populate({
        path: `students.cmd_skill`,
        select: `title`
    }).exec((err, teamData) => {

        res.render(`team-details`, {
            memberView: true,
            studentData: teamData.students,
            prevURL: prevURL,
            bannerTitle: teamData.name,
            bannerSubtitle: `Team overzicht`,
            error: false
        });
    });

});

module.exports = router;