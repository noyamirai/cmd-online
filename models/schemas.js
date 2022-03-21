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
    classes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: `Class`
    }],
    linkRef: {
        type: String,
        required: [true, `Why no ref?`]
    }
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
        type: mongoose.Schema.Types.ObjectId, ref: `Class`
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
        type: String,
    },
    classes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: `Class`
    }],
    courses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: `Course`
    }],
    type: {
        type: String,
        required: [true, `Why no user type?`]
    },
    is_admin: {
        type: String,
        required: [true, `Why no admin rights specified?`]
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
            best: [{
                type: mongoose.Schema.Types.ObjectId,
                ref: `cmdSkill`
            }],
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
    classes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: `Class`
    }],
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
    classes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: `Class`
    }],
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
    skill: {
        type: String,
        required: [true, `Why no skill defined?`]
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

const Course = mongoose.model(`Course`, courseSchema, `courses`);

const User = mongoose.model(`User`, userSchema, `users`);
const Student = mongoose.model(`Student`, userStudent, `students`);
const Teacher = mongoose.model(`Teacher`, userTeacher, `teachers`);

const Class = mongoose.model(`Class`, classSchema, `classes`);
const Team = mongoose.model(`Team`, teamSchema, `teams`);
const cmdSkill = mongoose.model(`cmdSkill`, cmdSkillSchema, `cmd_skills`);
const TeacherCourse = mongoose.model(`TeacherCourse`, teacherCourse, `teacher_course`);

module.exports = {
    Course,
    User,
    Student,
    Teacher,
    Class,
    Team,
    TeacherCourse,
    cmdSkill
};