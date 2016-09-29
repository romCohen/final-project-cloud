/**
 * Created by romcohen on 9/28/16.
 */
var mongoose = require('mongoose');
var Student = require('./models/Student.js');
var Lecturer = require('./models/Lecturer.js');
var Class = require('./models/Class.js');
var dbURL = 'mongodb://thrisno:clod@ds036789.mlab.com:36789/dibi'; // TODO: Need to update


function DB() {
    var db;

    /**
     * connect to remote db
     * @param onConnection
     */
    this.init = function (onInit) {
        mongoose.connect(dbURL);
        db = mongoose.connection;
        db.on('error', console.error.bind(console, 'connection error:'));

        db.once('open', onInit);
    };

    /**
     * create DB instance of student object
     * @param studentId
     * @param classesList
     * @return {Array} of classes who's id's are not in the DB
     */
    this.createStudent = function(studentId, classesList) {
        // Make sure the student doesn't exist in the DB
        if (Student.findOne({id : studentId}).count() > 0) {
            console.error("Student " + str(studentId) + " already exists");
            throw err;
        }
        var list = enrollStudentToClasses(studentId, classesList);
        var classes = list[0], badClasses = list[1];
        // Create Student document
        new Student({
            id: studentId,
            classes: classes
        }).save(function (err) {
            if (err) return console.error(err);
        });

        return badClasses;
    };


    /**
     * Enroll the given student to all classes in the list
     * @param studentId The given student's ID.
     * @param classesList Array of classes IDs
     * @return {Array} size of 2, first is array of existing classes, second is non-existing classes.
     */
    this.enrollStudentToClasses = function(studentId, classesList) {

        // check the classes id's exist in th DB
        var badClasses = [], classes = [];
        for(var classIndex in classesList) {
            var classId = [classesList[classIndex]];
            if (Class.findOne({id : classId}).count() > 0) {
                console.error("Class " + str(classId) + " already exists");
                badClasses.push(classId)
            } else {
                classes.push({classId : classId, attendance : 0});
            }
        }

        // Add student to classes
        for(var classIndex in classes) {
            var classId = [classes[classIndex]];
            Class.findOne({id : classId}, function(err, classObj) {
                if (err) throw err;
                classObj.Students.push(studentId);
                classObj.save(function (err) {
                    if (err) return console.log(err);
                });
            });
        }
        return [classes, badClasses]
    };

    /**
     * create DB instance of Lecturer object
     * @param lecturerId
     * @param classesList
     */
    this.createLecturer = function(lecturerId, classesList) {
        new Lecturer({
            id: lecturerId,
            classes: classesList
        }).save(function (err) {
            if (err) return console.error(err);
        });
    };

    /**
     * create DB instance of Lecturer object
     * @param studentId
     * @param classesList
     */
    this.createClass = function(classId, studentsList, lecturerId, classSchedule) {
        if (Lecturer.findOne({id : lecturerId}).count() == 0) {
            console.error("Lecturer " + str(lecturerId) + " doesn't exist");
            throw err;
        }
        new Class({
            id: classId,
            Students: [],
            LecturerId : lecturerId,
            schedule : classSchedule,
            roomID : String,
            numberOfClasses : 0
        }).save(function (err) {
            if (err) return console.error(err);
        });
    };


    /**
     * Update The DB of the attendance of the given class
     * @param classId
     * @param studentsInAttendance - array of student IDs
     */
    this.updateAttendances = function(classId, studentsInAttendance) {
        Class.findOne({id : classId}, function (err, classFound) {
            if (err) throw err;
            classFound.numberOfClasses++;
            classFound.save(function (err) {
                if (err) throw err;
            });
        });
        Student.find({}, function (err, students) {
            if (err) throw err;
            students.forEach(function (student) {
                // Check if this student attended the class
                if (studentsInAttendance.indexOf(student.id) != -1) {
                    var classes = student.classes;
                    for (var i = 0; i < classes.length; i++) {
                        if (classes[i].classId == classId) {
                            // update the class
                            classes.attendance += 1;
                            student.save(function (err) {
                                if (err) return console.log(err);
                            });
                            break;
                        }
                    }
                }
            });
        });
    };


    /**
     * Return an array of {classId, numberOfClassesAttended, totlaNumberOfClasses} of all classes the given student takes.
     * @param studentId The given student id.
     * @returns {Array} Of {classId, numberOfClassesAttended, totlaNumberOfClasses} of all classes the given student takes.
     */
    this.getStudentAttendance = function(studentId) {
        var classes = [];
        Student.findOne({id : studentId}, function(err, student) {
            if (err) {
                console.error("can't find student");
                throw err;
            }
            classes = student.classes;
        });
        Class.find({}, function(err, allClasses) {
            if (err) throw err;
            allClasses.forEach(function (classObj) {
                // Check if the class is in the student's classes
                var index = inClasses(classes, classObj.id);
                if (index != -1) {
                    classes[index].totalClasses = classObj.numberOfClasses;
                }
            });
        });
        return classes
    };


    /**
     * Check if the classId is in classes.
     * @param classes An array of {classId, number}.
     * @param classId
     * @returns {int} Return index of class in the array iff the class is classes, else return -1.
     */
    inClasses = function(classes, classId) {
        for (var i = 0; i < classes.length; i++) {
            if (classes[i].classId == classId) {
                return i;
            }
        }
        return -1;
    };

    /**
     * Return an array of {studentId, numberOfClassesAttended} of all students the given student takes.
     * @param studentId The given student id.
     * @returns {Array} Of {studentId, numberOfClassesAttended} of all students the given student takes.
     */
    this.getAttendanceOfClass = function(classId) {
        var students = [];
        Class.findOne({id : classId}, function(err, classObj) {
            if (err) {
                console.error("can't find class");
                throw err;
            }
            students = classObj.Students;
        });
        Student.find({}, function(err, allStudents) {
            if (err) throw err;
            allStudents.forEach(function (student) {
                // Check if the class is in the student's classes
                var index = students.indexOf(student.id);
                if (index != -1) {
                    var classIndex = inClasses(student.classes, classId);
                    students[index] = {
                        id : student.id,
                        classAttendance : student.classes[classIndex].attendance
                    };
                }
            });
        });
        return students
    };

}
module.exports = DB;