/**
 * Created by romcohen on 9/28/16.
 */
var mongoose = require('mongoose');
var User = require('./models/Users.js');
var Student = require('./models/Student.js');
var Lecturer = require('./models/Lecturer.js');
var Class = require('./models/Class.js');
var dbURL = 'mongodb://clod:1234@ds036789.mlab.com:36789/dibi'; // TODO: Need to update

var weekday = new Array(7);
weekday["sunday"]= 0 ;
weekday["monday"] = 1;
weekday["tuesday"] = 2;
weekday["wednesday"] = 3;
weekday["thursday"] = 4;
weekday["friday"] = 5;
weekday["saturday"] = 6;


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
     * Add a new user to the User schema
     * @param userId
     * @param password
     * @param role
     */
    var addNewUser = function(userId, password, role) {
        // Make sure the student doesn't exist in the DB
        User.find({id : userId}, function(err, users) {
            if (err) throw err;
            if (users.length > 0) {
                err = "User " + String(userId) + " already exists";
                console.error(err);
                throw err;
            } else {
                new User({
                    username: userId,
                    password: password,
                    userRole: role
                }).save(function(err) {
                    if (err) return console.error(err);
                });
            }
        });

    };

    /**
     * Enroll the given student to all classes in the list
     * @param studentId The given student's ID.
     * @param classesList Array of classes IDs
     * @return {Array} size of 2, first is array of existing classes, second is non-existing classes.
     */
    var enrollStudentToClasses = function(studentId, classesList, cb) {

        // check the classes id's exist in th DB
        var classes = [];
        var cursor = Class.find({}).cursor();
        cursor.on('data', function(classObj) {
            console.log(classObj);
            var index = classesList.indexOf(classObj.id);
            if (index != -1) {
                classes.push({classId : classObj.id, attendance : 0});
            }
        });
        cursor.on('end', function() {
            console.log(classes);
            var classCursor = Class.find({id : { $in: classesList }}).cursor();
            classCursor.on('data', function(classObj) {
                var index = classObj.Students.indexOf(studentId);
                if (index === -1) {
                    classObj.Students.push(studentId);
                    classObj.save(function (err) {
                        if (err) return console.log(err);
                    });
                }
            });
            classCursor.on('end', function() {cb(classes);})
        });
    };

    /**
     * Check if DB instance of with the given studentId exists, if not create it.
     * @param studentId
     * @param classesList
     * @return {Array} of classes who's id's are not in the DB
     */
    this.createStudent = function(studentId, classesList, password, MACAddress, cb) {
        // Make sure the student doesn't exist in the DB
        Student.find({id : studentId}, function(err, users) {
            if (err) throw err;
            if (users != null && users.length > 0) {
                err = "Student " + String(studentId) + " already exists";
                console.error(err);
                cb(err);
            } else {
                addStudent(studentId, classesList, password, MACAddress, cb)
            }
        });
    };


    /**
     * create DB instance of student object
     * @param studentId
     * @param classesList
     * @return {Array} of classes who's id's are not in the DB
     */
    var addStudent = function(studentId, classesList, password, MACAddress, cb) {
        enrollStudentToClasses(studentId, classesList, function (classes) {
            // Create Student document
            new Student({
                id: studentId,
                classes: classes,
                MAC: MACAddress
            }).save(function (err) {
                if (err) return console.error(err);
            });
            addNewUser(studentId, password, "Student");
            cb(null);
        });
    };

    /**
     * Use the given call back function on the given ids
     */
    this.useStudents = function(studentIds, cb) {
        var students = [];
        if (typeof studentIds === 'undefined' || studentIds.length === 0) {
            var cursor = Student.find({}).cursor();
            cursor.on('data', function(student) {
                students.push(student)
            });
            cursor.on('end', cb(students))
        } else {
            var cursor = Student.find({id : { $in: studentIds }}).cursor();
            cursor.on('data', function(student) {
                students.push(student)
            });
            cursor.on('end', cb(students))
        }
    };

    /**
     * create DB instance of Lecturer object
     * @param lecturerId
     * @param classesList
     */
    this.createLecturer = function(lecturerId, classesList, password, cb) {
        // Make sure the lecturer doesn't exist in the DB
        Lecturer.find({id : lecturerId}, function(err, users) {
            if (err) throw err;
            if (users.length > 0) {
                err = "Lecturer " + String(lecturerId) + " already exists";
                console.error(err);
                cb(err);
            } else {
                new Lecturer({
                    id: lecturerId,
                    classes: classesList
                }).save(function (err) {
                    if (err) return console.error(err);
                });
                addNewUser(lecturerId, password, "Admin");
                cb(null)
            }
        });
    };


    /**
     * Use the given call back function on the given ids
     */
    this.useLecturers = function(lecturerIds, cb) {
        var lecturers = [];
        if (typeof lecturerIds === 'undefined' || lecturerIds.length === 0) {
            var cursor = Lecturer.find({}).cursor();
            cursor.on('data', function(lecturer) {
                lecturers.push(lecturer)
            });
            cursor.on('end', cb(lecturers))
        } else {
            var cursor = Lecturer.find({id : { $in: lecturerIds }}).cursor();
            cursor.on('data', function(lecturer) {
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
    this.createClass = function(classId, studentsList, lecturerId, roomName, classSchedule, cb) {
        // Make sure the lecturer doesn't exist in the DB
        Class.find({id : classId}, function(err, users) {
            if (err) throw err;
            if (users != null && users.length > 0) {
                err = "Class " + String(classId) + " already exists";
                console.error(err);
                cb(err);
            } else {
                for (var i = 0; i < classSchedule.length; i++) {
                    classSchedule[i].day = weekday[classSchedule[i].day.toLowerCase()];
                }
                new Class({
                    id: classId,
                    Students: [],
                    LecturerId : lecturerId,
                    schedule : classSchedule,
                    roomID : roomName,
                    numberOfClasses : 0
                }).save(function (err) {
                    if (err) return console.error(err);
                });
                cb(null)
            }
        });
    };


    /**
     * Use the given call back function on the given ids
     */
    this.useClasses = function(classIds, cb) {
        var classes = [];
        if (typeof classIds === 'undefined' || classIds.length === 0) {
            var cursor = Lecturer.find({}).cursor();
            cursor.on('data', function(classObj) {
                classes.push(classObj)
            });
            cursor.on('end', cb(classes))
        } else {
            var cursor = Lecturer.find({id : { $in: classIds }}).cursor();
            cursor.on('data', function(classObj) {
                classes.push(classObj)
            });
            cursor.on('end', function() {cb(classes)})
        }
    };

    /**
     * Use the given call back on the class the was held in {roomId} at this current time.
     * @param roomId - The given roomId.
     * @param cb - The given call back function.
     */
    this.useClassIdByDate = function(roomId, cb) {
        var returnClass,
            currentDate = new Date();
        var cursor = Class.find({roomID : roomId}).cursor();
        cursor.on('data', function(classObj) {
            for (var i = 0; i < classObj.schedule.length; i++){
                if (classObj.schedule[i].day === currentDate.getDay() &&
                    classObj.schedule[i].start === currentDate.getHours() &&
                    classObj.schedule[i].end > currentDate.getHours()) {
                    returnClass = classObj;
                    break;
                }
            }
        });
        cursor.on('end', function() {
           cb(returnClass)
        });
    };

    /**
     * Update The DB of the attendance of the given class
     * @param classId
     * @param studentsInAttendance - array of student MAC's
     * @param cb - call back function
     */
    this.updateAttendances = function(classObj, studentsInAttendance, cb) {
        classObj.numberOfClasses++;
        classObj.save(function (err) {
            if (err) {
                console.log(err);
                cb(err)
            }
        });
        var cursor = Student.find({MAC : { $in:studentsInAttendance}}).cursor();
        cursor.on('data', function (student) {
            var classes = student.classes;
            for (var i = 0; i < classes.length; i++) {
                if (classes[i].classId === classObj.id) {
                    // update the class
                    classes.attendance++;
                    student.save(function (err) {
                        if (err) {
                            console.log(err);
                            cb(err)
                        }
                    });
                    break;
                }
            }
        });

    };


    /**
     * Return an array of {classId, attendance, totalClasses} of all classes the given student takes.
     * @param studentId The given student id.
     */
    this.getStudentAttendance = function(studentId, cb) {
        var classes = [];
        var cursor = Student.find({id : studentId}).cursor();
        cursor.on('data', function(student) {
            classes = student.classes;
        });
        cursor.on('end', function() {
            var secondCursor = Class.find({}).cursor();
            secondCursor.on('data',function(classObj) {
                // Check if the class is in the student's classes
                var index = inClasses(classes, classObj.id);
                if (index != -1) {
                    classes[index].totalClasses = classObj.numberOfClasses;
                }
            });
            secondCursor.on('end', function() {cb(classes)});
        });
    };


    /**
     * Check if the classId is in classes.
     * @param classes An array of {classId, number}.
     * @param classId
     * @returns {int} Return index of class in the array iff the class is classes, else return -1.
     */
    var inClasses = function(classes, classId) {
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
        var cursor = Class.find({id : classId}).cursor();
        cursor.on('data', function(classObj) {
            students = classObj.Students;
        });
        cursor.on('end', function() {
            var secondCursor = Student.find({id : { $in:students}}).cursor();
            var index = 0;
            secondCursor.on('data', function(student) {
                var classIndex = inClasses(student.classes, classId);
                students[index] = {
                    id: student.id,
                    classAttendance: student.classes[classIndex].attendance
                };
                index++;
            });
            secondCursor.on('end', function() {cb(students)});
        });
    };


    this.getAllStudents = function(cb) {
        var students = [];
        var cursor = Student.find({}).cursor();
        cursor.on('data', function(student) {
            students.push({
                id: student.id,
                MAC: student.MAC,
                classes: student.classes
            })
        });
        cursor.on('end', function() {
            cb(students)
        });
    };

    this.getAllLecturers = function(cb) {
        var lecturers = [];
        var cursor = Lecturer.find({}).cursor();
        cursor.on('data', function(lecturer) {
            lecturers.push({
                id: lecturer.id,
                classes: lecturer.classes
            })
        });
        cursor.on('end', function() {
            cb(lecturers)
        });
    };

    this.getAllClasses = function(cb) {
        var classes = [];
        var cursor = Class.find({}).cursor();
        cursor.on('data', function(classObj) {
            classes.push({
                id: classObj.id,
                Students: classObj.Students,
                LecturerId : classObj.LecturerId,
                roomID : classObj.roomID,
                schedule : classObj.schedule,
                numberOfClasses : classObj.numberOfClasses
            })
        });
        cursor.on('end', function() {
            cb(classes)
        });
    }
}
module.exports = DB;