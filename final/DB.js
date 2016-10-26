/**
 * Created by romcohen on 9/28/16.
 */
var mongoose = require('mongoose');
var User = require('./models/Users.js');
var Student = require('./models/Student.js');
var Lecturer = require('./models/Lecturer.js');
var Class = require('./models/Class.js');
var dbURL = 'mongodb://clod:1234@ds036789.mlab.com:36789/dibi'; // TODO: Need to update

String.prototype.hashCode = function() {
    var hash = 0, i, chr, len;
    if (this.length === 0) return hash;
    for (i = 0, len = this.length; i < len; i++) {
        chr   = this.charCodeAt(i);
        hash  = ((hash << 5) - hash) + chr;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
};


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
     * Fill the data structures from app: lectures, classes, and students.
     */
    //this.fillDatastructures = function() {
    //    // Get classes
    //    Class.find({}, function(err, classes) {
    //        for(var i = 0; i < classes.length; i++) {
    //            var newClass = {};
    //            newClass.id = classes[i].id;
    //            newClass.Students = classes[i].Students;
    //            newClass.roomID = classes[i].roomID;
    //            newClass.schedule = classes[i].schedule;
    //            newClass.numberOfClasses = classes[i].numberOfClasses;
    //        }
    //    });
    //
    //    // Get students
    //    Student.find({}, function(err, students) {
    //       for(var i = 0; i < students.length; i++) {
    //           var newStudent = {};
    //           newStudent.id = students[i].id;
    //           newStudent.classes = students[i].classes;
    //       }
    //    });
    //
    //    // Get classes
    //    Lecturer.find({}, function(err, lecturers) {
    //        for(var i = 0; i < lecturers.length; i++) {
    //            var newClass = {};
    //            newClass.id = lecturers[i].id;
    //            newClass.classes = lecturers[i].classes;
    //        }
    //    });
    //};

    /**
     * Add a new user to the User schema
     * @param userId
     * @param password
     * @param role
     */
    var addNewUser = function(userId, password, role) {
        if (User.findOne({id : userId}).count() > 0) {
            console.error("User " + str(userId) + " already exists");
            throw err;
        }
        new User({
            id: userId,
            password: password,
            userRole: role
        }).save(function(err) {
            if (err) return console.error(err);
        });
    };

    /**
     * create DB instance of student object
     * @param studentId
     * @param classesList
     * @return {Array} of classes who's id's are not in the DB
     */
    this.createStudent = function(studentId, classesList, password) {
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
        addNewUser(studentId, password, "Student");
        return badClasses;
    };

    /**
     * Use the given call back function on the given ids
     */
    this.useStudents = function(studentIds, cb) {
        var students = [];
        if (typeof studentIds === 'undefined' || studentIds.length === 0) {
            var cursor = Student.find({}).cursor();
            cursor.on('data', function(err, student) {
                if (err) throw err;
                students.push(student)
            });
            cursor.on('end', cb(students))
        } else {
            var cursor = Student.find({id : { $in: studentIds }}).cursor();
            cursor.on('data', function(err, student) {
                if (err) throw err;
                students.push(student)
            });
            cursor.on('end', cb(students))
        }
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
    this.createLecturer = function(lecturerId, classesList, password) {
        new Lecturer({
            id: lecturerId,
            classes: classesList
        }).save(function (err) {
            if (err) return console.error(err);
        });
        addNewUser(lecturerId, password, "Admin");
    };


    /**
     * Use the given call back function on the given ids
     */
    this.useLecturers = function(lecturerIds, cb) {
        var lecturers = [];
        if (typeof lecturerIds === 'undefined' || lecturerIds.length === 0) {
            var cursor = Lecturer.find({}).cursor();
            cursor.on('data', function(err, lecturer) {
                if (err) throw err;
                lecturers.push(lecturer)
            });
            cursor.on('end', cb(lecturers))
        } else {
            var cursor = Lecturer.find({id : { $in: lecturerIds }}).cursor();
            cursor.on('data', function(err, lecturer) {
                if (err) throw err;
                lecturers.push(lecturer)
            });
            cursor.on('end', cb(lecturers))
        }

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
     * Use the given call back function on the given ids
     */
    this.useClasses = function(classIds, cb) {
        var classes = [];
        if (typeof classIds === 'undefined' || classIds.length === 0) {
            var cursor = Lecturer.find({}).cursor();
            cursor.on('data', function(err, classObj) {
                if (err) throw err;
                classes.push(classObj)
            });
            cursor.on('end', cb(classes))
        } else {
            var cursor = Lecturer.find({id : { $in: classIds }}).cursor();
            cursor.on('data', function(err, classObj) {
                if (err) throw err;
                classes.push(classObj)
            });
            cursor.on('end', cb(classes))
        }

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
     * Return an array of {classId, attendance, totalClasses} of all classes the given student takes.
     * @param studentId The given student id.
     */
    this.getStudentAttendance = function(studentId, cb) {
        var classes = [];
        Student.findOne({id : studentId}, function(err, student) {
            if (err) {
                console.error("can't find student");
                throw err;
            }
            classes = student.classes;
        });
        var cursor = Class.find({}).cursor();
        cursor.on('data',function(err, allClasses) {
            if (err) throw err;
            allClasses.forEach(function (classObj) {
                // Check if the class is in the student's classes
                var index = inClasses(classes, classObj.id);
                if (index != -1) {
                    classes[index].totalClasses = classObj.numberOfClasses;
                }
            });
        });
        cursor.on('end', cb(classes));
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
    this.getAttendanceOfClass = function(classId, cb) {
        var students = [];
        Class.findOne({id : classId}, function(err, classObj) {
            if (err) {
                console.error("can't find class");
                throw err;
            }
            students = classObj.Students;
        });
        var cursor = Student.find({}).cursor();
        cursor.on('data', function(err, allStudents) {
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
        cursor.on('end', cb(students));
    };

}
module.exports = DB;