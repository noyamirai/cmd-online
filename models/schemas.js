//Require Mongoose
const mongoose = require(`mongoose`);

const courseSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, `Why no course Title?`]
    },
    students: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: `Student`
    }],
    teachers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: `Teacher`
    }],
    classes: {
        normal: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: `Class`
        }],
        elective: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: `ElectiveClass`
        }]
    },
    linkRef: {
        type: String,
        required: [true, `Why no ref?`]
    },
    in_blok: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: `SchoolBloks`
    }],
    in_year: {
        type: Number,
        enum: [1, 2, 3, 4],
        required: [true, 'Why no year?']
    },
    type: {
        type: String,
        enum: ['normal', 'project', 'project_class', 'elective'],
        default: 'normal'
    },
    accompanying_courses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: `Course`
    }]
}, {
    collection: `courses`
}, {
    toJSON: {
        virtuals: true
    }
});

const classSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, `Why no class name?`]
    },
    students: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: `Student`
    }],
    teachers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: `Teacher`
    }],
    courses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: `Course`
    }],
    teams: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: `Team`
    }],
    linkRef: {
        type: String,
        required: [true, `Why no ref?`]
    },
    in_year: {
        type: Number,
        enum: [1, 2, 3, 4],
        required: [true, 'Why no school year?']
    }
}, {
    collection: `classes`
}, {
    toJSON: {
        virtuals: true
    }
});

const teamSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, `Why no class name?`]
    },
    number: {
        type: Number,
        required: [true, `Why no number to identify w?`]
    },
    students: [{
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: `Student`
        },
        cmd_skill: {
            type: mongoose.Schema.Types.ObjectId,
            ref: `cmdSkill`
        }
    }],
    class: {
        normal: {
            type: mongoose.Schema.Types.ObjectId,
            ref: `Class`
        },
        elective: {
            type: mongoose.Schema.Types.ObjectId,
            ref: `ElectiveClass`
        }
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: `Course`
    }
}, {
    collection: `teams`
}, {
    toJSON: {
        virtuals: true
    }
});

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, `Why no username?`]
    },
    email: {
        type: String,
        required: [true, `Why no email?`]
    },
    password: {
        type: String,
        required: [true, `Why no password?`]
    },
    name: {
        type: Object,
        required: [true, `Why no name object?`],
        properties: {
            first: {
                type: String,
                required: [true, `Why no first name?`]
            },
            insertion: {
                type: String,
            },
            last: {
                type: String,
                required: [true, `Why no last name?`]
            }
        }
    },
    profile_pic: {
        type: String
    },
    type: {
        type: String,
        required: [false, `Why no user type?`]
    },
    is_admin: {
        type: String,
        required: [false, `Why no admin rights specified?`]
    }
}, {
    collection: `users`
}, {
    toJSON: {
        virtuals: true
    }
});

const userStudent = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: `User`
    },
    cmd_skills: {
        type: Object,
        required: [true, `Why no CMD skills?`],
        properties: {
            best: {
                type: mongoose.Schema.Types.ObjectId,
                ref: `cmdSkill`
            },
            want_to_learn: [{
                type: mongoose.Schema.Types.ObjectId,
                ref: `cmdSkill`
            }]
        }
    },
    teams: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: `Team`
    }],
    classes: {
        normal: {
            type: mongoose.Schema.Types.ObjectId,
            ref: `Class`
        },
        elective: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: `ElectiveClass`
        }]
    },
    courses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: `Course`
    }]
}, {
    collection: `students`
}, {
    toJSON: {
        virtuals: true
    }
});

const userTeacher = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: `User`
    },
    classes: {
        normal: {
            type: mongoose.Schema.Types.ObjectId,
            ref: `Class`
        },
        elective: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: `ElectiveClass`
        }]
    },
    courses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: `Course`
    }]
}, {
    collection: `teachers`
}, {
    toJSON: {
        virtuals: true
    }
});

const cmdSkillSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, `Why no skill defined?`]
    },
    linkRef: {
        type: String,
        required: [true, 'Why no linkRef']
    }
}, {
    collection: `cmd_skills`
}, {
    toJSON: {
        virtuals: true
    }
});

const teacherCourse = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: `User`
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: `Course`
    },
    classes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: `Class`
    }]
}, {
    collection: `classes`
}, {
    toJSON: {
        virtuals: true
    }
});

const schoolYear = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Why no school year?']
    },
    linkRef: {
        type: Number,
        enum: [1, 2, 3, 4],
        required: [true, 'Why no year slug?']
    },
    courses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: `Course`
    }],
    classes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: `Class`
    }]
}, {
    collection: `school_year`
}, {
    toJSON: {
        virtuals: true
    }
});

const schoolBloks = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Why no school blok?']
    },
    linkRef: {
        type: String,
        enum: ['1_normal', '2_normal', '3_elective', '3_internship', '4_elective', '4_internship'],
        required: [true, 'Why no blok linkRef?']
    },
    courses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: `Course`
    }]
}, {
    collection: `school_bloks`
}, {
    toJSON: {
        virtuals: true
    }
});

const electiveClassSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, `Why no class name?`]
    },
    students: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: `Student`
    }],
    teachers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: `Teacher`
    }],
    courses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: `Course`
    }],
    teams: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: `Team`
    }],
    linkRef: {
        type: String,
        required: [true, `Why no ref?`]
    }
}, {
    collection: `elective_classes`
}, {
    toJSON: {
        virtuals: true
    }
});

const Course = mongoose.model(`Course`, courseSchema, `courses`);

const User = mongoose.model(`User`, userSchema, `users`);
const Student = mongoose.model(`Student`, userStudent, `students`);
const Teacher = mongoose.model(`Teacher`, userTeacher, `teachers`);

const Class = mongoose.model(`Class`, classSchema, `classes`);
const Team = mongoose.model(`Team`, teamSchema, `teams`);
const cmdSkill = mongoose.model(`cmdSkill`, cmdSkillSchema, `cmd_skills`);
const TeacherCourse = mongoose.model(`TeacherCourse`, teacherCourse, `teacher_course`);

const SchoolYear = mongoose.model('SchoolYear', schoolYear, 'school_year');
const SchoolBloks = mongoose.model('SchoolBloks', schoolBloks, 'school_bloks');
const ElectiveClass = mongoose.model('ElectiveClass', electiveClassSchema, 'elective_classes');

module.exports = {
    Course,
    User,
    Student,
    Teacher,
    Class,
    Team,
    TeacherCourse,
    cmdSkill,
    SchoolYear,
    SchoolBloks,
    ElectiveClass
};