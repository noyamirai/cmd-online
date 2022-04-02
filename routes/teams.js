const express = require('express');
const router = express.Router({
    mergeParams: true
});
const {
    ensureAuthenticated
} = require('../config/authenticate');
const schemas = require('../models/schemas');
const CRUD = require(`../controller/crud-operations`);
const team = require(`../controller/team-generator`);


// Form page: teacher can only get here when JS is disabled
router.get(`/`, ensureAuthenticated, (req, res) => {
    const prevURLPath = new URL(req.headers.referer);
    let url = prevURLPath.pathname.split('/');
    url.shift();

    const prevURL = {
        username: url[0],
        course: url[1],
        class: url[2]
    };

    let schema;

    CRUD.findDocByQuery(schemas.Course, 'linkRef', prevURL.course).then((courseData) => {

        if (courseData.type != 'normal') {
            schema = schemas.ElectiveClass;
        } else {
            schema = schemas.Class;
        }

        CRUD.findDocByQuery(schema, 'linkRef', prevURL.class).then((classObject) => {

            res.render('team-generation', {
                bannerTitle: classObject.title,
                bannerSubtitle: `${classObject.students.length} studenten`,
                linkRef: classObject.linkRef,
                isPopup: false,
                formURL: '/create',
                prevURL: prevURLPath.pathname,
                classTeams: classObject.teams
            });

        });
    });
});

// TODO: PUT THESE ROUTES ON OVERVIEW BC WE NEED COURSE/CLASS PARAMS

router.post('/create', (req, res) => {
    const prevURLPath = new URL(req.headers.referer);
    let url = prevURLPath.pathname.split('/');
    url.shift();

    const prevURL = {
        username: url[0],
        course: url[1],
        class: url[2]
    };

    const classLink = prevURL.class.split('_')[0];

    const teamSize = req.body.teamSize;

    let allStudentObjects = [];
    let allTeams = [];

    CRUD.findDocByQuery(schemas.Course, 'linkRef', prevURL.course).then((courseData) => {
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
            linkRef: classLink
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
            'linkRef': classLink
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


module.exports = router;