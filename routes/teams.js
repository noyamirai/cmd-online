const express = require('express');
const router = express.Router({
    mergeParams: true
});
const {
    ensureAuthenticated
} = require('../config/authenticate');
const schemas = require('../models/schemas');
const CRUD = require(`../controller/crud-operations`);


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


module.exports = router;