/* eslint-disable no-undef */
const express = require(`express`);
const app = express();
const port = process.env.PORT || 3000;

const db = require(`./config/db`);

const schemas = require('./models/schemas');
const CRUD = require(`./controller/crud-operations`);

const acronymGen = require(`./public/js/acronym-generator`);

app.set(`view engine`, `ejs`);

app.use(`/public`, express.static(`public`));

// ROUTES
app.use('/', require('./routes/home'));
// app.use('/:username', require('./routes/user'));

db.connectDb();

app.get(`/:username/courses`, (req, res) => {
    const baseURL = req.path;

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
                root: req.baseUrl,
                baseURL: baseURL,
                userData: userData,
                courseData: courseData
            });
        });
    });
});

app.get(`/:username/courses/:course/classes`, (req, res) => {
    const baseURL = req.path;

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
                                root: req.baseUrl,
                                prevURL: `/${req.params.username}/courses`,
                                baseURL: baseURL,
                                userData: user,
                                courseData: paramCourse,
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

app.get(`/:username/courses/:course/classes/:class`, (req, res) => {
    const baseURL = req.path;

    // get course object
    CRUD.findDocByQuery(schemas.Course, `linkRef`, req.params.course).then((courseData) => {

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

                console.log(classData);

                res.render(`class-details`, {
                    layout: `default-yellow`,
                    baseURL: baseURL,
                    root: req.baseUrl,
                    prevURL: `/${req.params.username}/courses/${req.params.course}/classes`,
                    formURL: `${baseURL}/teams/team-generation`,
                    userData: classData.students,
                    bannerTitle: classData.title,
                    bannerSubtitle: `${classData.students.length} studenten`,
                    courseData: courseData,
                    linkRef: classObject.linkRef,
                    classTeams: classObject.teams,
                    className: `overflow form`
                });

            });
        });
    });
});

app.get(`*`, (req, res) => {
    res.status(404).send(`Page not found!`);
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});