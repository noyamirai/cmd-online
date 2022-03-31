// const CRUD = require('../controller/crud-operations');
// const schemas = require('../models/schemas');
// const paramCase = require('param-case');
// const db = require('../config/db');
// db.connectDb();

// CRUD.createMultipleDocs(schemas.Course, [
//     {
//         title: 'Content Delivery',
//         linkRef: paramCase.paramCase('Content Delivery'),
//         in_blok: ['6241abeb7922cfeee8b07983', '6241abeb7922cfeee8b07984'],
//         in_year: 2,
//         type: 'normal' 
//     },
//     {
//         title: 'Ontwerponderzoek',
//         linkRef: paramCase.paramCase('Ontwerponderzoek'),
//         in_blok: ['6241abeb7922cfeee8b07983', '6241abeb7922cfeee8b07984'],
//         in_year: 2,
//         type: 'normal' 
//     },
//     {
//         title: 'Project Beyond',
//         linkRef: paramCase.paramCase('Project Beyond'),
//         in_blok: ['6241abeb7922cfeee8b07983', '6241abeb7922cfeee8b07984'],
//         in_year: 2,
//         type: 'normal' 
//     },
//     {
//         title: 'Ubicomp',
//         linkRef: paramCase.paramCase('Ubicomp'),
//         in_blok: ['6241abeb7922cfeee8b07983', '6241abeb7922cfeee8b07984'],
//         in_year: 2,
//         type: 'normal' 
//     },
//     {
//         title: 'Front-end Development 1',
//         linkRef: paramCase.paramCase('Front-end Development 1'),
//         in_blok: ['6241abeb7922cfeee8b07983', '6241abeb7922cfeee8b07984'],
//         in_year: 2,
//         type: 'normal' 
//     },
//     {
//         title: 'Project Responsive Multi Device Design',
//         linkRef: paramCase.paramCase('Project Responsive Multi Device Design'),
//         in_blok: ['6241abeb7922cfeee8b07983', '6241abeb7922cfeee8b07984'],
//         in_year: 2,
//         type: 'normal' 
//     },
//     {
//         title: 'Vormgeving 2',
//         linkRef: paramCase.paramCase('Vormgeving 2'),
//         in_blok: ['6241abeb7922cfeee8b07983', '6241abeb7922cfeee8b07984'],
//         in_year: 2,
//         type: 'normal' 
//     }
// ]).then((data) => {
//     data.forEach(item => {
//         CRUD.addIdReferenceToDoc(schemas.SchoolBloks, ['6241abeb7922cfeee8b07983', '6241abeb7922cfeee8b07984'], 'courses', item.id);
//         CRUD.addIdReferenceToDoc(schemas.SchoolYear, '623f5bdd7e6402036fae21ea', 'courses', item.id);
//     });
// });

// CRUD.createMultipleDocs(schemas.cmdSkill, [
//     {
//         skill: "Front-end"
//     },
//     {
//         skill: "Back-end"
//     },
//     {
//         skill: "User Interface Design"
//     },
//     {
//         skill: "User Experience Design"
//     },
//     {
//         skill: "Grafische Vormgeving"
//     },
//     {
//         skill: "Projectmanagement"
//     },
//     {
//         skill: "Datavisualisatie"
//     },
//     {
//         skill: "Documentatie"
//     },
//     {
//         skill: "Presenteren"
//     },
//     {
//         skill: "Samenwerken"
//     },
//     {
//         skill: "Video editing"
//     },
//     {
//         skill: "Video montage"
//     },
//     {
//         skill: "Fotografie"
//     },
//     {
//         skill: "Illustratie"
//     },
//     {
//         skill: "3D Design"
//     },
//     {
//         skill: "Branding"
//     },
//     {
//         skill: "Product Design"
//     }
// ])

// CRUD.createMultipleDocs(schemas.Class, [
//     {
//         title: "Tech-1",
//         courses: ["622a2645eefd9fbcf4bf8606", "622a2645eefd9fbcf4bf8607", "622a2645eefd9fbcf4bf8608"],
//         linkRef: "tech-1"
//     },
//     {
//         title: "Tech-2",
//         courses: ["622a2645eefd9fbcf4bf8606", "622a2645eefd9fbcf4bf8607", "622a2645eefd9fbcf4bf8608"],
//         linkRef: "tech-2"
//     },
//     {
//         title: "Tech-3",
//         courses: ["622a2645eefd9fbcf4bf8606", "622a2645eefd9fbcf4bf8607", "622a2645eefd9fbcf4bf8608"],
//         linkRef: "tech-3"
//     }
// ]).then((result) => {
//     for(let classObject of result) {
//         // find course id in course schema and then add classId to classes array
//         CRUD.addIdReferenceToDoc(schemas.Course, classObject.courses, "classes", classObject.id);
//     }
// });

// CRUD.createMultipleDocs(schemas.User, [
//      {
//         username: "roberrrt-s",
//         email: "atest@hva.nl",
//         password: "stinkypassword",
//         name: {
//             first: "Robert",
//             last: "Spier"
//         },
//         profile_pic: "https://avatars.githubusercontent.com/u/6113643?v=4",
//         courses: ["622a2645eefd9fbcf4bf8606", "622a2645eefd9fbcf4bf8607"],
//         classes: [],
//         type: "teacher",
//         is_admin: false
//     },
//     {
//         username: "dandevri",
//         email: "btest@hva.nl",
//         password: "stinkypassword",
//         name: {
//             first: "Danny",
//             insertion: "de",
//             last: "Vries"
//         },
//         profile_pic: "https://avatars.githubusercontent.com/u/22084444?v=4",
//         courses: ["622a2645eefd9fbcf4bf8606", "622a2645eefd9fbcf4bf8607", "622a2645eefd9fbcf4bf8608"],
//         classes: [],
//         type: "teacher",
//         is_admin: false
//     },
//     {
//         username: "rouws",
//         email: "ctest@hva.nl",
//         password: "stinkypassword",
//         name: {
//             first: "Sonja",
//             last: "Rouwhorst"
//         },
//         profile_pic: "https://avatars.githubusercontent.com/u/2169878?v=4",
//         courses: ["622a2645eefd9fbcf4bf8608"],
//         classes: [],
//         type: "teacher",
//         is_admin: false
//     },
//     {
//         username: "ivo-online",
//         email: "dtest@hva.nl",
//         password: "stinkypassword",
//         name: {
//             first: "Ivo",
//             last: "Nijhuis"
//         },
//         profile_pic: "https://avatars.githubusercontent.com/u/75486733?v=4",
//         courses: ["622a2645eefd9fbcf4bf8606"],
//         classes: [],
//         type: "teacher",
//         is_admin: false
//     }
// ]).then((result) => {

//     for(let userObject of result) {
//         userObject.courses.forEach(courseId => {
//             CRUD.createDoc(schemas.TeacherCourse, { userId: userObject.id, course: courseId })
//         });

//         CRUD.addIdReferenceToDoc(schemas.Course, userObject.courses, "teachers", userObject.id);
//         CRUD.createDoc(schemas.Teacher, { user: userObject.id, classes: userObject.classes, courses: userObject.courses })
//     }
// });

// CRUD.createMultipleDocs(schemas.User, [
//     {
//         username: "bixenmant001",
//         email: "etest@hva.nl",
//         password: "stinkypassword",
//         name: {
//             first: "Tanya",
//             last: "Bixenman"
//         },
//         profile_pic: "https://minimaltoolkit.com/images/randomdata/female/77.jpg",
//         courses: ["622a2645eefd9fbcf4bf8606", "622a2645eefd9fbcf4bf8607", "622a2645eefd9fbcf4bf8608"],
//         classes: ["622a27778fd2b3f9caa2e2e3"],
//         type: "student",
//         is_admin: false
//     },
//     {
//         username: "mcgareyj001",
//         email: "etest@hva.nl",
//         password: "stinkypassword",
//         name: {
//             first: "Jayson",
//             last: "Mcgarey"
//         },
//         profile_pic: "https://minimaltoolkit.com/images/randomdata/male/24.jpg",
//         courses: ["622a2645eefd9fbcf4bf8606", "622a2645eefd9fbcf4bf8607", "622a2645eefd9fbcf4bf8608"],
//         classes: ["622a27778fd2b3f9caa2e2e3"],
//         type: "student",
//         is_admin: false
//     },
//     {
//         username: "stickforth001",
//         email: "etest@hva.nl",
//         password: "stinkypassword",
//         name: {
//             first: "Herb",
//             last: "Stickfort"
//         },
//         profile_pic: "https://minimaltoolkit.com/images/randomdata/male/42.jpg",
//         courses: ["622a2645eefd9fbcf4bf8606", "622a2645eefd9fbcf4bf8607", "622a2645eefd9fbcf4bf8608"],
//         classes: ["622a27778fd2b3f9caa2e2e3"],
//         type: "student",
//         is_admin: false
//     },
//     {
//         username: "kretchmerm001",
//         email: "etest@hva.nl",
//         password: "stinkypassword",
//         name: {
//             first: "Martina",
//             last: "Kretchmer"
//         },
//         profile_pic: "https://minimaltoolkit.com/images/randomdata/female/104.jpg",
//         courses: ["622a2645eefd9fbcf4bf8606", "622a2645eefd9fbcf4bf8607", "622a2645eefd9fbcf4bf8608"],
//         classes: ["622a27778fd2b3f9caa2e2e3"],
//         type: "student",
//         is_admin: false
//     },
//     {
//         username: "kaufmanh001",
//         email: "ftest@hva.nl",
//         password: "stinkypassword",
//         name: {
//             first: "Harold",
//             last: "Kaufman"
//         },
//         profile_pic: "https://minimaltoolkit.com/images/randomdata/male/62.jpg",
//         courses: ["622a2645eefd9fbcf4bf8606", "622a2645eefd9fbcf4bf8607", "622a2645eefd9fbcf4bf8608"],
//         classes: ["622a27778fd2b3f9caa2e2e3"],
//         type: "student",
//         is_admin: false
//     },
//     {
//         username: "abidie001",
//         email: "gtest@hva.nl",
//         password: "stinkypassword",
//         name: {
//             first: "Eustolia",
//             last: "Abidi"
//         },
//         profile_pic: "https://minimaltoolkit.com/images/randomdata/female/2.jpg",
//         courses: ["622a2645eefd9fbcf4bf8606", "622a2645eefd9fbcf4bf8607", "622a2645eefd9fbcf4bf8608"],
//         classes: ["622a27778fd2b3f9caa2e2e3"],
//         type: "student",
//         is_admin: false
//     },
//     {
//         username: "bloniarzo001",
//         email: "htest@hva.nl",
//         password: "stinkypassword",
//         name: {
//             first: "Olimpia",
//             last: "Bloniarz"
//         },
//         profile_pic: "https://minimaltoolkit.com/images/randomdata/female/57.jpg",
//         courses: ["622a2645eefd9fbcf4bf8606", "622a2645eefd9fbcf4bf8607", "622a2645eefd9fbcf4bf8608"],
//         classes: ["622a27778fd2b3f9caa2e2e3"],
//         type: "student",
//         is_admin: false
//     },
//     {
//         username: "rufoloc001",
//         email: "etest@hva.nl",
//         password: "stinkypassword",
//         name: {
//             first: "Cornelius",
//             last: "Rufolo"
//         },
//         profile_pic: "https://minimaltoolkit.com/images/randomdata/male/43.jpg",
//         courses: ["622a2645eefd9fbcf4bf8606", "622a2645eefd9fbcf4bf8607", "622a2645eefd9fbcf4bf8608"],
//         classes: ["622a27778fd2b3f9caa2e2e3"],
//         type: "student",
//         is_admin: false
//     },
//     {
//         username: "lehrfeldr001",
//         email: "ftest@hva.nl",
//         password: "stinkypassword",
//         name: {
//             first: "Roderick",
//             last: "Lehrfeld"
//         },
//         profile_pic: "https://minimaltoolkit.com/images/randomdata/male/88.jpg",
//         courses: ["622a2645eefd9fbcf4bf8606", "622a2645eefd9fbcf4bf8607", "622a2645eefd9fbcf4bf8608"],
//         classes: ["622a27778fd2b3f9caa2e2e3"],
//         type: "student",
//         is_admin: false
//     },
//     {
//         username: "venabler001",
//         email: "gtest@hva.nl",
//         password: "stinkypassword",
//         name: {
//             first: "Ruthie",
//             last: "Venable"
//         },
//         profile_pic: "https://minimaltoolkit.com/images/randomdata/female/106.jpg",
//         courses: ["622a2645eefd9fbcf4bf8606", "622a2645eefd9fbcf4bf8607", "622a2645eefd9fbcf4bf8608"],
//         classes: ["622a27778fd2b3f9caa2e2e3"],
//         type: "student",
//         is_admin: false
//     },
//     {
//         username: "vilj001",
//         email: "htest@hva.nl",
//         password: "stinkypassword",
//         name: {
//             first: "Jeromy",
//             last: "Vil"
//         },
//         profile_pic: "https://minimaltoolkit.com/images/randomdata/male/42.jpg",
//         courses: ["622a2645eefd9fbcf4bf8606", "622a2645eefd9fbcf4bf8607", "622a2645eefd9fbcf4bf8608"],
//         classes: ["622a27778fd2b3f9caa2e2e3"],
//         type: "student",
//         is_admin: false
//     },
//     {
//         username: "kirtc001",
//         email: "etest@hva.nl",
//         password: "stinkypassword",
//         name: {
//             first: "Claire",
//             last: "Kirt"
//         },
//         profile_pic: "https://minimaltoolkit.com/images/randomdata/female/54.jpg",
//         courses: ["622a2645eefd9fbcf4bf8606", "622a2645eefd9fbcf4bf8607", "622a2645eefd9fbcf4bf8608"],
//         classes: ["622a27778fd2b3f9caa2e2e3"],
//         type: "student",
//         is_admin: false
//     },
//     {
//         username: "paapej001",
//         email: "ftest@hva.nl",
//         password: "stinkypassword",
//         name: {
//             first: "Joseph",
//             last: "Paape"
//         },
//         profile_pic: "https://minimaltoolkit.com/images/randomdata/male/89.jpg",
//         courses: ["622a2645eefd9fbcf4bf8606", "622a2645eefd9fbcf4bf8607", "622a2645eefd9fbcf4bf8608"],
//         classes: ["622a27778fd2b3f9caa2e2e3"],
//         type: "student",
//         is_admin: false
//     },
//     {
//         username: "zezzac001",
//         email: "gtest@hva.nl",
//         password: "stinkypassword",
//         name: {
//             first: "Cherelle",
//             last: "Zezza"
//         },
//         profile_pic: "https://minimaltoolkit.com/images/randomdata/female/35.jpg",
//         courses: ["622a2645eefd9fbcf4bf8606", "622a2645eefd9fbcf4bf8607", "622a2645eefd9fbcf4bf8608"],
//         classes: ["622a27778fd2b3f9caa2e2e3"],
//         type: "student",
//         is_admin: false
//     },
//     {
//         username: "freethe001",
//         email: "htest@hva.nl",
//         password: "stinkypassword",
//         name: {
//             first: "Estrella",
//             last: "Freeth"
//         },
//         profile_pic: "https://avatars.githubusercontent.com/u/90140220?v=4",
//         courses: ["622a2645eefd9fbcf4bf8606", "622a2645eefd9fbcf4bf8607", "622a2645eefd9fbcf4bf8608"],
//         classes: ["622a27778fd2b3f9caa2e2e3"],
//         type: "student",
//         is_admin: false
//     }
// ]).then((result) => {

//     for(let userObject of result) {
//         CRUD.addIdReferenceToDoc(schemas.Course, userObject.courses, "students", userObject.id);
//         CRUD.addIdReferenceToDoc(schemas.Class, userObject.classes, "students", userObject.id);
//         CRUD.createDoc(schemas.Student, { user: userObject.id, cmd_skills: { best: ["622a0cbb6df854b8951e7e55"], want_to_learn: ["622a0cbb6df854b8951e7e55"]}, classes: userObject.classes, courses: userObject.courses })
//     }
// });

// CRUD.createMultipleDocs(schemas.SchoolYear, [
//     {
//         year: 'Eerste jaar',
//         slug: 1,
//     },
//     {
//         year: 'Tweede jaar',
//         slug: 2,
//         classes: ['623877ace3b297f0608bb406', '623877ace3b297f0608bb407', '623877ace3b297f0608bb408']
//     },
//     {
//         year: 'Derde jaar',
//         slug: 3,
//     },
//     {
//         year: 'Vierde jaar',
//         slug: 4,
//     }
// ]);

// CRUD.createMultipleDocs(schemas.SchoolBloks, [
//     {
//         title: 'Blok 1',
//         linkRef: '1_normal'
//     },
//     {
//         title: 'Blok 2',
//         linkRef: '2_normal'
//     },
//     {
//         title: 'Blok 3: STAGE',
//         linkRef: '3_internship'
//     },
//     {
//         title: 'Blok 3: KEUZEBLOK',
//         linkRef: '3_elective',
//         courses: ['62386607b31742dbaa43dca9', '62386607b31742dbaa43dca8', '62386607b31742dbaa43dca7']
//     },
//     {
//         title: 'Blok 4: STAGE',
//         linkRef: '4_internship'
//     },
//     {
//         title: 'Blok 4: KEUZEBLOK',
//         linkRef: '4_elective',
//         courses: ['62386607b31742dbaa43dca9', '62386607b31742dbaa43dca8', '62386607b31742dbaa43dca7']
//     }
// ]);