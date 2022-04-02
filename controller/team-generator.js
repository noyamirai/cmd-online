/* eslint-disable no-inner-declarations */
const generate = async (students, teamSize) => {

    let allTeams = [];
    let teamObject;

    let studentsInTeam = [];

    let teamCounter = 0;

    const amountOfTeams = Math.floor(students.length / teamSize); // round down
    const remainders = students.length % teamSize;

    let updatedStudentArray = [];

    /**
     * * Creating teamObjects and looping through them
     */
    for (let i = 0; i < amountOfTeams; i++) {
        teamCounter++;
        teamObject = {
            name: `team-${teamCounter}`,
            number: teamCounter
        };
        allTeams.push(teamObject);

        // console.log(`TEAM ${teamCounter}`);

        /**
         * * Creating x amount of students based on @param teamSize
         */
        for (let i = 0; i < teamSize; i++) {
            let result;

            // logging purposes
            studentsInTeam.forEach(member => {
                console.log(`student in TEAM ${teamCounter}: ${member.name} with skill: ${member.cmd_skill}`);
            });

            /**
             * * Check whether or not students have been added to teams (modified students array)
             */
            if (updatedStudentArray.length > 0) {
                result = getRandomStudent(updatedStudentArray, studentsInTeam);

            } else {
                result = getRandomStudent(students);
            }

            let student = result[0];
            updatedStudentArray = result[1];

            console.log(`adding: ${student.user.name.first} with skill: ${student.cmd_skills.best}`);
            studentsInTeam.push({
                name: student.user.username,
                student: student._id,
                cmd_skill: student.cmd_skills.best
            });
        }

        function getRandomStudent(allStudents, teamMembers) {
            const randomIndex = Math.floor(Math.random() * (allStudents.length - 1));
            const student = allStudents[randomIndex];

            let findDuplicates = false;

            /**
             * * Check if team has members so we can check their cmd skills
             */
            if (Array.isArray(teamMembers) && teamMembers.length > 0) {

                // logging purposes
                console.log(`team has members!`);
                teamMembers.forEach(member => {
                    console.log(`member: ${member.name} with skill: ${member.cmd_skill}`);
                });
                console.log(`new potential student: ${student.user.name.first} with skill: ${student.cmd_skills.best}`);

                /**
                 * * Compare skills of existing team members with new potential student
                 * TODO: create function for comparing
                 */
                for (let i = 0; i < teamMembers.length; i++) {
                    const value = teamMembers[i];
                    console.log(`comparing ${value.cmd_skill} with ${student.cmd_skills.best}`);

                    if (value.cmd_skill.equals(student.cmd_skills.best)) {
                        findDuplicates = true;
                        break;
                    }
                }

                console.log(`duplicate?: ${findDuplicates}`);

                /**
                 * * Check if random student's cmd skill is already inside team
                 */
                if (findDuplicates) {
                    // check what skills are left in allStudents

                    console.log(`skill already found in team :(`);
                    let allSkills = allStudents.map(e => e.cmd_skills.best);

                    /**
                     * * Find out which skills are still left. If all skills are the same, 
                     * * just add into team. If they're all different, locate student
                     */
                    if (new Set(allSkills).size === 1) {
                        console.log(`all students left have the same cmd skills LMAO so just add to team`);
                        const updatedStudentArray = allStudents.filter(item => item._id != student._id);
                        return [student, updatedStudentArray];

                    } else {
                        console.log(`students still have different skills!`);

                        let newStudent;

                        /**
                         * * Go through all new potential students
                         */
                        for (let i = 0; i < allStudents.length; i++) {
                            let duplicate = false;
                            const potentialStudent = allStudents[i];

                            console.log(`okay! going through students and finding unique one`);
                            console.log(`potential new member: ${potentialStudent.user.name.first} their skill: ${potentialStudent.cmd_skills.best}`);

                            /**
                             * * Compare skills of existing team members with new potential student
                             * TODO: create function for comparing
                             */
                            for (let i = 0; i < teamMembers.length; i++) {
                                const value = teamMembers[i];
                                console.log(`comparing ${value.cmd_skill} with ${potentialStudent.cmd_skills.best}`);

                                if (value.cmd_skill.equals(potentialStudent.cmd_skills.best)) {
                                    console.log('potential new member has same skill as this team member! Grab next student!?');
                                    duplicate = true;
                                    break;
                                }
                            }

                            console.log(`is there duplicate?: ${duplicate}`);

                            /**
                             * * If student has unique skill, add them to team
                             */
                            if (!duplicate) {
                                console.log(`potential new member doesnt have same skill as this team member!`);
                                newStudent = potentialStudent;

                                const updatedStudentArray = allStudents.filter(item => item._id != newStudent._id);
                                return [newStudent, updatedStudentArray];
                            }
                        }
                    }

                } else {
                    /**
                     * * Totally unique skill on first try :p
                     */
                    const updatedStudentArray = allStudents.filter(item => item._id != student._id);
                    return [student, updatedStudentArray];
                }
            }
            const updatedStudentArray = allStudents.filter(item => item._id != student._id);
            return [student, updatedStudentArray];
        }

        allTeams[i].students = studentsInTeam;
        studentsInTeam = [];
    }

    /**
     * * If only 1 student remaining, add into last team. If more than one, create new team w remainders
     * TODO: add this into it's own function
     */
    if (remainders == 1) {
        updatedStudentArray.forEach((student) => {
            allTeams[amountOfTeams - 1].students.push({
                student: student._id,
                cmd_skill: student.cmd_skills.best
            });
        });
    } else if (remainders > 1) {
        let newStudentsInTeam = [];

        updatedStudentArray.forEach((student) => {
            newStudentsInTeam.push({
                student: student._id,
                cmd_skill: student.cmd_skills.best
            });
        });

        allTeams.push({
            name: `team-${teamCounter}`,
            students: newStudentsInTeam
        });
    }

    return allTeams;
};

module.exports = {
    generate
};