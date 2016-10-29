var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User = require('./models/Users.js');
var session = require('express-session');
var busboy = require('connect-busboy');


var app = express();


// view engine setup
app.set('views', path.join(__dirname, '/views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({ secret: 'hold the door' }));
app.use(passport.initialize());
app.use(passport.session());
app.use(busboy());

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  //If using Mongoose with MongoDB; if other you will need JS specific to that schema
    done(null, user);
});

// log in strategy - userID and password
passport.use(new LocalStrategy(function(userId, password, done) {
  userId = parseInt(userId)
  process.nextTick(function() {
    User.findOne({
      'username': userId
    }, function(err, user) {
      if (err) {
        return done(err);
      }

      if (!user) {
        return done(null, false);
      }

      if (user.password !== password) {
        return done(null, false);
      }

      return done(null, user);
    });
  });
}));

var returnStatusFunction = function(res) {
  return function(err) {
    if (err) {
      res.status(500).end(err);
    } else {
      res.status(200).end();
    }
  }
};
app.use('/public',express.static(path.join(__dirname, 'public')));
// redirect successful login according to the user role
app.post('/login',
    passport.authenticate('local'),
    function(req, res) {
      // If this function gets called, authentication was successful.
      if (req.user.userRole == 'Admin') {
        res.end('/adminMain')
      } else if (req.user.userRole == 'Student') {
        res.end('/students');
        console.log("redirect to student");

      } else {
        // Shouldn't reach here, if so there is a bug in creating Users in the DB
        console.log("User " + user.username.toString + "has illegal role: " + req.user.userRole);
        res.redirect('/')
      }
    });

// login - to check data
app.get('/', function (req, res) {
  res.render('enter.jade');
});

// TODO: uncomment this
//demand authentication from this point on
app.all('*',require('connect-ensure-login').ensureLoggedIn('/'),function(a,b,next){
  next();
});

//------------------------------------------Student-------------------------------------

// Students data page
app.get('/students', function (req, res) {
  res.render('studentsView.jade');
});

//Students data request
app.get('/students/data', function (req, res) {
  //dataBase.getStudentAttendance(req.user.username, function(classes) {
  //  if (!classes) {
  //    res.status(500).end(classes);
  //  } else {
  //    res.status(200).json(classes);
  //  }
  dataBase.getStudentAttendance(req.user.username, function(classes) {
    if (!classes) {
      res.status(500).end(classes);
    } else {
      res.status(200).json(classes);
    }
  });
});

// TODO : add classes, remove classes

app.post('/addStudent', function (req, res) {
  dataBase.createStudent(req.body.id, req.body.classList, req.body.password, req.body.MACAddress,
      returnStatusFunction(res));
});


//------------------------------------------Lecturer-------------------------------------

app.all('/admin*', function(req, res, next) {
  if (req.user.userRole !== 'Admin') {
    res.redirect('/');
  } else {
    next();
  }
});

// Students data page
app.get('/admin/Lecturer', function (req, res) {
  res.render('adminView.jade'); // TODO: Write the name of the file
});

//Students data request
app.get('/admin/Lecturer/class/:classId', function (req, res) {
  dataBase.getAttendanceOfClass(req.params.classId, function(classes) {
    if (!classes) {
      res.status(500).end(classes);
    } else {
      res.status(200).json(classes);
    }
  });
});

// TODO : add classes, remove classes

app.post('/admin/addLecturer', function (req, res) {
  dataBase.createLecturer(req.body.id, req.body.password, req.body.name, returnStatusFunction(res));
});

app.post('/admin/addClass', function (req, res) {
  dataBase.createClass(req.body.id, req.body.studentList, req.body.lecturerId, req.body.roomId, req.body.schedule,
      returnStatusFunction(res));
});

//------------------------------------------Admin----------------------------------------

app.get('/adminMain', function (req, res) {
  res.render('adminView.jade'); // TODO: Write the name of the file
});

app.get('/admin/students', function(req, res) {
  dataBase.getAllStudents(function(result) {
    res.status(200).json(result)
  })
});

app.get('/admin/classes', function(req, res) {
  dataBase.getAllClasses(function(result) {
    res.status(200).json(result)
  })
});

app.get('/admin/lecturers', function(req, res) {
  dataBase.getAllLecturers(function(result) {
    res.status(200).json(result)
  })
});


//---------------------------------------------Pi----------------------------------------

// Data from raspberry Pi
/*
   {
   roomId: String,
   studentsMac: [String],
   }
 */
app.post('/pidata', function (req, res) {
  database.useClassIdByDate(req.body.roomId, function(returnClass) {
    database.updateAttendances(returnClass, req.body.studentsMac, returnStatusFunction(res))
  });
});

//------------------------------------------Errors---------------------------------------

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

module.exports = app;
