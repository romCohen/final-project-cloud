/**
 * Created by romcohen on 9/28/16.
 */
var mongoose = require('mongoose');
var User = require('./models/Users.js');
var Student = require('./models/Student.js');
var Lecturer = require('./models/Lecturer.js');
var Class = require('./models/Class.js');
var dbURL = 'mongodb://clod:1234@ds036789.mlab.com:36789/dibi';

// Dictionaty for day name -> int
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
     * Add a new user to the User schema, if it does not exists
     * @param username - {int} Username for the new user, this coresponds to the ID in Student and Lecturer Schemas
     * @param password - {String} The user's password
     * @param role - {String} The role of the user, ether 'Student' or 'Admin'
     */
    var addNewUser = function(username, password, role, cb) {
        // Make sure the student doesn't exist in the DB
        User.find({username : username}, function(err, users) {
            if (err) throw err;
            if (users.length > 0) {
                err = "User " + String(username) + " already exists";
                console.error(err);
                throw err;
            } else {
                new User({
                    username: username,
                    password: password,
                    userRole: role
                }).save(function(err) {
                    if (err) return console.error(err);
                    cb();
                });
            }
        });

    };


    /**
     * Deprecated!!
     * Enroll the given student to all classes in the list
     * @param studentId - The given student's ID
     * @param classesList - Array of classes IDs
     * @return {Array} size of 2, first is array of existing classes, second is non-existing classes.
     */
    this.enrollStudentToClasses = function(studentId, classesList, cb) {

        // check the classes id's exist in th DB
        var classes = [];
        var cursor = Class.find({}).cursor();
        cursor.on('data', function(classObj) {
            console.log(classObj);
            var index = classesList.indexOf(classObj.id);
            if (index !== -1) {
                classes.push({classId : classObj.id, name: classObj.name, attendance : 0});
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
     * Add the given classes to the student with the given ID
     * @param newClasses - A list of object in the '{classId: Number, name: String, attendance: 0}' format, represent a
     * single class
     * @param studentId - {int} The ID of the given student
     */
    this.addClassesToStudent = function(newClasses, studentId) {
        Student.findOne({id: studentId}, addClassesToStudentDocument(newClasses))
    };


    /**
     * Returns a function of (err, Student document) that will add the given newClasses to document
     * @param newClasses - list of classes in '{classId: Number, name: String, attendance: 0}' format
     * @returns {Function} function of (err, Student document) that will add the given newClasses to document
     */
    var addClassesToStudentDocument = function(newClasses) {
        return function(err, student) {
            if (err) throw err;
            var classesToAdd = [];
            for (var i = 0; i < newClasses.length; i++) {
                var index = inClasses(student.classes, newClasses[i].classId);
                if (index === -1){
                    classesToAdd.push(newClasses[i])
                }
            }
            student.classes = student.classes.concat(classesToAdd);
            student.save(function (err) {
                if (err) return console.log(err);
            });
        }
    };


    /**
     * Check if DB document of with the given studentId exists, if not create it
     * @param studentId - {int} The given student ID
     * @param password - {String} The student's password
     * @param MACAddress - {String} The student's MAC address
     * @param cb - {Function} A call back function to use when function is over
     */
    this.createStudent = function(studentId, password, MACAddress, cb) {
        // Make sure the student doesn't exist in the DB
        Student.find({id : studentId}, function(err, users) {
            if (err) throw err;
            if (users != null && users.length > 0) {
                err = "Student " + String(studentId) + " already exists";
                console.error(err);
                cb(err);
            } else {
                var cursor = Class.find({}).cursor();
                var classesEnrolled = [];
                cursor.on('data', function(classObj) {
                    var index = classObj.Students.indexOf(studentId);
                    if (index !== -1) {
                        classesEnrolled.push({classId: classObj.id, name: classObj.name, attendance: 0})
                    }
                });
                cursor.on('end', function() {
                    addNewUser(studentId, password, "Student", function() {
                        new Student({
                            id: studentId,
                            classes: classesEnrolled,
                            MAC: MACAddress
                        }).save(function (err) {
                            if (err) return console.error(err);
                            cb(null);
                        });
                    });
                });
            }
        });
    };


    /**
     * Deprecated!!
     * Create DB instance of student object
     * @param studentId - The given student's ID
     * @param classesList - Array of classes IDs
     * @return {Array} of classes who's id's are not in the DB
     */
    var addStudent = function(studentId, classesList, password, MACAddress, cb) {
        this.enrollStudentToClasses(studentId, classesList, function (classes) {
            // Create Student document
            addNewUser(studentId, password, "Student", function() {
                new Student({
                    id: studentId,
                    classes: classesEnrolled,
                    MAC: MACAddress
                }).save(function (err) {
                    if (err) return console.error(err);
                    cb(null);
                });
            });
        });
    };


    /**
     * Use the given call back function on the given student IDs
     * @param studentIds - Array of the given student's IDs.
     * @param cb - {Function} A call back function that receives an array of Student documents
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
     * Check if DB document of with the given lecturerId exists, if not create it
     * @param lecturerId - {int} The given lecturer ID
     * @param password - {String} The lecturer's password
     * @param name - {String} The lecturer's name
     * @param cb - {Function} A call back function to use when function is over
     */
    this.createLecturer = function(lecturerId, password, name, cb) {
        // Make sure the lecturer doesn't exist in the DB
        Lecturer.find({id : lecturerId}, function(err, users) {
            if (err) throw err;
            if (users.length > 0) {
                err = "Lecturer " + String(lecturerId) + " already exists";
                console.error(err);
                cb(err);
            } else {
                var cursor = Class.find({LecturerId: LecturerId}).corsor();
                var classList = [];
                cursor.on('data', function (classObj) {
                    classList.push(classObj.id);
                });
                cursos.on('end', function() {
                    addNewUser(lecturerId, password, "Admin", function() {
                        new Lecturer({
                            id: lecturerId,
                            name: name,
                            classes: classList
                        }).save(function (err) {
                            if (err) {
                                console.error(err);
                                cb(err);
                            } else {
                                cb(null)
                            }
                        });
                    });
                });
            }
        });
    };


    /**
     * Use the given call back function on the given lecturer IDs
     * @param lecturerIds - Array of the given lecturer's IDs.
     * @param cb - {Function} A call back function that receives an array of Lecturer documents
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
                    classObj.schedule[i].end >= currentDate.getHours()) {
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
     * Check if DB document of with the given classId exists, if not create it
     * @param classId - {int} The given class ID
     * @param className - {String} The name of this class
     * @param studentsList - {Array} all the students enrolled to this class's IDs
     * @param lecturerId - {int} The lecturer teaching this class's ID
     * @param roomName - {String} The name of the room this class takes place at
     * @param classSchedule - {Array} of object of this '{day : String, start : Number, end : Number}' format
     * @param cb - {Function} A call back function to use when function is over
     */
    this.createClass = function(classId, className, studentsList, lecturerId, roomName, classSchedule, cb) {
        // Make sure the lecturer doesn't exist in the DB
        Class.find({id : classId}, function(err, users) {
            if (err) throw err;
            if (users != null && users.length > 0) {
                err = "Class " + String(classId) + " already exists";
                console.error(err);
                cb(err);
            } else {
                // Make sure no other class is scheduled to take place in this room at the same time
                var scheduleCursor = Class.find({roomID: roomName}).cursor();
                var scheduledClass;
                for (var i = 0; i < classSchedule.length; i++) {
                    classSchedule[i].day = weekday[classSchedule[i].day.toLowerCase()];
                }
                schedulecursor.on('data', function (classObj) {
                    for (var i = 0; i < classObj.schedule.length; i++) {
                        for (var j = 0; j < classSchedule.length; j++) {
                            if (classObj.schedule[i].day === classSchedule[j].day &&
                                classObj.schedule[i].start === classSchedule[j].start &&
                                classObj.schedule[i].end === classSchedule[j].end) {
                                scheduledClass = classObj;
                                break;
                            }
                        }
                    }
                });
                schedulecursor.on('end', function() {
                    if (scheduledClass != null) {
                        cb("Class " + scheduledClass.id + " is all ready scheduled on this time")
                    } else {
                        var cursor = Student.find({id : { $in:studentsList}}).cursor();
                        cursor.on('data', function (student) {
                            addClassesToStudentDocument([{classId: classId, name: className, attendance: 0}])(null, student)
                        });
                        new Class({
                            id: classId,
                            name: className,
                            Students: studentsList,
                            LecturerId : lecturerId,
                            schedule : classSchedule,
                            roomID : roomName,
                            numberOfClasses : 0
                        }).save(function (err) {
                            if (err) {
                                console.error(err);
                                cb(err);
                            }
                        });
                        cb(null)
                    }
                });

            }
        });
    };


    /**
     * Use the given call back function on the given class IDs
     * @param classIds - Array of the given class's IDs.
     * @param cb - {Function} A call back function that receives an array of Student documents
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
     * Update The DB of the attendance of the given class
     * @param classId - {int} The given class's IDs.
     * @param studentsInAttendance - {Array} of student MAC's
     * @param cb - call back function
     */
    this.updateAttendances = function(classObj, studentsInAttendance, cb) {
        // Increment the number of classes that took place by one
        classObj.numberOfClasses++;
        classObj.save(function (err) {
            if (err) {
                console.log(err);
                cb(err)
            }
        });
        // For each student that attended class increment their attendance counter (attendance) by one
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
     * Use the given call back function on an array of {classId, attendance, totalClasses} of all classes the given
     * student takes
     * @param studentId - {int} The given student id.
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


    /**
     * Use the given call back funtion on an array of '{id: Number, MAC: String, classes:
     * [{classId: Number, name: String, attendance: Number}] }'
     * for each Student document in the DB
     * @param cb - {Function} The given call back function
     */
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


    /**
     * Use the given call back funtion on an array of '{id: Number, classes: [Number]}'
     * for each Lecturer document in the DB
     * @param cb - {Function} The given call back function
     */
    this.getAllLecturers = function(cb) {
        var lecturers = [];
        var cursor = Lecturer.find({}).cursor();
        cursor.on('data', function(lecturer) {
            lecturers.push({
                id: lecturer.id,
                name: lecturer.name,
                classes: lecturer.classes
            })
        });
        cursor.on('end', function() {
            cb(lecturers)
        });
    };


    /**
     * Use the given call back funtion on an array of '{
     *       id: Number,
     *       name: String,
     *       Students: [Number],
     *       LecturerId : Number,
     *       roomID : String,schedule : [{day : Number, start : Number, end : Number}],
     *       numberOfClasses : Number
     * }' for each Class document in the DB
     * @param cb - {Function} The given call back function
     */
    this.getAllClasses = function(cb) {
        var classes = [];
        var cursor = Class.find({}).cursor();
        cursor.on('data', function(classObj) {
            classes.push({
                id: classObj.id,
                name: classObj.name,
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