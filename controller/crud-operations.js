/**
 *   createDoc
 *   * Create document based on object and add into schema/collection
 *
 *   @param schema: in which collection/schema do you want to add this document? (Model)
 *   @param object: what are you adding into this schema? (object)
 **/
const createDoc = async (schema, object) => {
    return new Promise((resolve, reject) => {
        const doc = new schema(object);

        doc.save((err) => {
            if (err) reject(err);
            console.log(`New doc added to db`);
            resolve(doc);
        });
    });
};

/**
 *   createMultipleDocs
 *   * Create multiple documents with array of objects and add into schema/collection
 *
 *   @param schema: in which collection/schema do you want to add these documents? (Model)
 *   @param objects: what are you adding into this schema? ([objects])
 **/
const createMultipleDocs = async (schema, objects) => {
    return new Promise((resolve, reject) => {
        schema.insertMany(objects, (err, result) => {
            if (err) reject(err);
            console.log(`Multiple docs added to db`);
            resolve(result);
        });
    });
};

/**
 *   findDocByQuery
 *   * Locate specific document in a collection and return said document
 *
 *   @param schema: in which collection/schema should the doc you're locating be in? (Model)
 *   @param attribute: how do you want to locate this document? (String)
 *   @param equalTo: what should the attribute be equal to? (String) or (ObjectId)
 **/
const findDocByQuery = async (schema, attribute, equalTo) => {
    return new Promise((resolve, reject) => {
        schema.find({
            [`${attribute}`]: {
                '$eq': equalTo,
                '$exists': true
            }
        }, (err, result) => {
            if (err) reject(err);

            if (!result.length) {
                console.log(`doc not found in db: ${attribute}: ${equalTo} IN SCHEMA ${schema}`);
            } else {
                result.forEach((doc) => {
                    console.log(`doc found in db`);
                    resolve(doc);
                });
            }
        });
    });
};

/**
 *   AddIdReferenceToDoc
 *   * Update one or multiple documents from a certain schema with one or more reference ids 
 *
 *   @param schemaToFind: in which collection/schema is the document you want to update located? (Model)
 *   @param docIds: what is the id of the to be updated document? (ObjectId) or ([ObjectId])
 *   @param referenceSchemas: which attribute of the to be updated document are you updating? (String)
 *   @param referenceSchemas: which reference id are you adding into the attribute? (ObjectId) or ([ObjectId])
 **/
const addIdReferenceToDoc = async (schemaToFind, docIds, referenceSchemas, referenceIds) => {

    // one doc to be updated with single id
    if (!Array.isArray(docIds) && !Array.isArray(referenceIds)) {
        await findDocByQuery(schemaToFind, `_id`, docIds).then((doc) => {
            doc[referenceSchemas].push(referenceIds);
            doc.save();
            console.log(`reference id added to doc`);
        });

        // one doc to be updated with multiple ids
    } else if (!Array.isArray(docIds) && Array.isArray(referenceIds)) {

        for (let id in referenceIds) {
            await findDocByQuery(schemaToFind, `_id`, docIds).then((doc) => {
                doc[referenceSchemas].push(id);
                doc.save();
                console.log(`multiple reference ids added to doc`);
            });
        }

        // multiple docs to be updated with single id
    } else if (Array.isArray(docIds) && !Array.isArray(referenceIds)) {

        for (let id of docIds) {
            await findDocByQuery(schemaToFind, `_id`, id).then((doc) => {
                doc[referenceSchemas].push(referenceIds);
                doc.save();
                console.log(`reference id added to multiple docs`);
            });
        }

        // multiple docs to be updated with multiple ids
    } else {
        for (let id of docIds) {
            await findDocByQuery(schemaToFind, `_id`, id).then((doc) => {
                for (let id in referenceIds) {
                    doc[referenceSchemas].push(id);
                    doc.save();
                    console.log(`multiple reference ids added to multiple docs`);
                }
            });
        }
    }
};

const schemas = require('../models/schemas');

/**
 *   removeFromClasses
 *   * Pulls userId from a specific class type depending on user type
 *
 *   @param classTypeSchema: in which collection/schema is the document you want to update located? (Model: elective or normal)
 *   @param classType: what type of class is it? 'elective' or 'normal'
 *   @param userObject: which user has to be removed from this class? (Object)
 *   @param userType: what kind of user is this? 'student' or 'teacher'
 **/
const removeFromClasses = (classTypeSchema, classType, userObject, userType) => {
    console.log(userObject.classes[classType]);
    console.log(userObject._id);

    classTypeSchema.updateMany({
        '_id': {
            $in: userObject.classes[classType]
        }
    }, {
        $pullAll: {
            [userType]: [userObject._id]
        }
    }).then(console.log('User removed from classes'));
};

/**
 *   removeUserFromClassesAndCourses
 *   * Updates all classes and courses by pulling userId from their respective reference id field (students or teachers)
 *
 *   @param schemaToFind: in which collection/schema is the document you want to update located? (Model: Student or Teacher)
 *   @param userId: which user has to be removed from this class? (ObjectId)
 *   @param type: what kind of user is this? 'student' or 'teacher'
 **/
const removeUserFromClassesAndCourses = (schemaToFind, userId, type) => {
    return new Promise((resolve) => {
        schemaToFind.findOne({
            'user': userId
        }).then((user) => {

            if (user.classes != null) {
                console.log('User appears to be part of classes and courses');
                console.log(user.classes);

                removeFromClasses(schemas.ElectiveClass, 'elective', user, type);
                removeFromClasses(schemas.Class, 'normal', user, type);

                schemas.Course.updateMany({
                    '_id': {
                        $in: user.courses
                    }
                }, {
                    $pullAll: {
                        [type]: [user._id]
                    }
                });

                resolve(user);

                console.log('User no longer part of any classes or courses');

            } else {
                resolve(user);
                console.log('User was not part of any classes or courses');
            }
        });
    });
};

/**
 *   addStudentToClassesAndCourses
 *   * Updates all classes and courses by adding userId to their respective reference id field (students)
 *
 *   @param schemaToFind: in which collection/schema is the document you want to update located? (Model: Student)
 *   @param savedInfo: saved STUDENT data from form (Object)
 *   @param userId: which user has to be removed from this class? (ObjectId)
 **/
const addStudentToClassesAndCourses = (schemaToFind, savedInfo, userId) => {
    return new Promise((resolve) => {
        let allCourses = [];

        const inBlok = savedInfo.in_block;
        const blockType = inBlok.substring(inBlok.indexOf('_') + 1);

        if (blockType == 'normal') {

            savedInfo.main_class_courses.forEach(item => {
                allCourses.push(item);
            });

            schemaToFind.findOneAndUpdate({
                'user': userId
            }, {
                classes: {
                    normal: savedInfo.main_class
                },
                courses: allCourses,
            }, {
                returnNewDocument: true
            }).then((object) => {
                resolve({
                    user: object,
                    courseData: allCourses
                });
            });

        } else if (blockType == 'elective') {

            savedInfo.block_project_courses.forEach(item => {
                allCourses.push(item);
            });

            allCourses.push(savedInfo.block_project, savedInfo.block_elective);
            schemaToFind.findOneAndUpdate({
                'user': userId
            }, {
                classes: {
                    normal: savedInfo.main_class,
                    elective: [savedInfo.block_elective_class, savedInfo.block_project_class]
                },
                courses: allCourses,
            }, {
                returnNewDocument: true
            }).then((object) => {
                resolve({
                    user: object,
                    courseData: allCourses
                });
            });
        }
    });
};

/**
 *   addTeacherToClassesAndCourses
 *   * Updates all classes and courses by adding userId to their respective reference id field (teachers)
 *
 *   @param schemaToFind: in which collection/schema is the document you want to update located? (Model: Teacher)
 *   @param savedInfo: saved TEACHER data from form (Object)
 *   @param userId: which user has to be removed from this class? (ObjectId)
 **/
const addTeacherToClassesAndCourses = (schemaToFind, savedInfo, userId) => {
    return new Promise((resolve) => {

        const courseType = savedInfo.course_type;

        if (courseType != 'normal') {

            schemaToFind.findOneAndUpdate({
                'user': userId
            }, {
                classes: {
                    elective: savedInfo.course_classes
                },
                courses: savedInfo.teacher_course,
            }, {
                returnNewDocument: true
            }).then((object) => {
                resolve(object);
            });

        } else {

            schemaToFind.findOneAndUpdate({
                'user': userId
            }, {
                classes: {
                    normal: savedInfo.course_classes
                },
                courses: savedInfo.teacher_course,
            }, {
                returnNewDocument: true
            }).then((object) => {
                resolve(object);
            });

        }
    });
};

/**
 *   resetTeams
 *   * Removes all teams from relevant collections in order to prevent duplicates when generating new teams
 *
 *   @param teamsToDelete: which teams will be deleted? [ObjectId]
 *   @param classTypeSchema: from which class do the teams have to be removed? (Elective or Class)
 *   @param classLinkRef: linkRef of the class that needs to be found
 *   @param studentIds: from which students do the teams have to be removed? [ObjectIds]
 **/
const resetTeams = async (teamsToDelete, classTypeSchema, classLinkRef, studentIds) => {
    schemas.Team.deleteMany({
        '_id': {
            $in: teamsToDelete
        }
    }).then(console.log('All teams removed from teams collection'));

    classTypeSchema.findOneAndUpdate({
        'linkRef': classLinkRef
    }, {
        'teams': []
    }).then(console.log('All teams removed from class'));

    schemas.Student.updateMany({
        '_id': {
            $in: studentIds
        }
    }, {
        $pullAll: {
            'teams': teamsToDelete
        }
    }).then(console.log('Team removed from student objects'));
};

/**
 *   getClassSchema
 *   * Returns correct class schema based on course type
 *
 *   @param courseType: what kind of course is it? (String)
 **/
const getClassSchema = (courseType) => {

    if (courseType != 'normal') {
        return schemas.ElectiveClass;
    } else {
        return schemas.Class;
    }
};

/**
 *   deleteCourse
 *   * Removes courses from relevant collections
 *
 *   @param courseToDelete: which course has to be deleted? (ObjectId)
 *   @param courseType: what type of course is it? (normal or not)
 **/
const deleteCourses = async (courseToDelete, courseType) => {
    let classTypeSchema = getClassSchema(courseType);

    const toBeUpdated = [
        schemas.Teacher,
        schemas.Student,
        schemas.SchoolBloks,
        schemas.SchoolYear,
        classTypeSchema
    ];

    schemas.Course.deleteMany({
        '_id': courseToDelete
    }).then(console.log(`All courses deleted from course collection`));

    schemas.TeacherCourse.deleteMany({
        'course': courseToDelete
    }).then(console.log(`All courses deleted from teacher course collection`));

    toBeUpdated.forEach((schema) => {
        schema.updateMany({
            'courses': courseToDelete
        }, {
            $pull: {
                'courses': courseToDelete
            }
        });
    });

    console.log('Course deleted from other relevant collections');

    schemas.Team.find({
        'course': courseToDelete
    }).then((teamObjects) => {

        if (teamObjects.length) {
            console.log('Teams linked to course');

            let teamIds = [];

            teamObjects.forEach((team) => {
                teamIds.push(team.id);
            });

            schemas.Team.deleteMany({
                'course': courseToDelete
            }).then(() => {
                console.log(`Deleted all teams with connection to course`);

                schemas.Student.updateMany({
                    'teams': {
                        $in: teamIds
                    }
                }, {
                    $pullAll: {
                        'teams': teamIds
                    }
                }).then(console.log('Teams with connection to course deleted from student object'));

                classTypeSchema.updateMany({
                    'teams': {
                        $in: teamIds
                    }
                }, {
                    $pullAll: {
                        'teams': teamIds
                    }
                }).then(console.log('Teams with connection to course deleted from class object'));
            });

        } else {
            console.log('No teams linked to course');
        }
    });
};

module.exports = {
    createDoc,
    createMultipleDocs,
    findDocByQuery,
    addIdReferenceToDoc,
    removeUserFromClassesAndCourses,
    addStudentToClassesAndCourses,
    addTeacherToClassesAndCourses,
    resetTeams,
    getClassSchema,
    deleteCourses
};