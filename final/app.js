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


var app = express();


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
//app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({ secret: 'hold the door' }));
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  //If using Mongoose with MongoDB; if other you will need JS specific to that schema
  User.findById(id, function (err, user) {
    done(err, user);
  });
});

// log in strategy - userID and password
passport.use(new LocalStrategy(function(userId, password, done) {
  process.nextTick(function() {
    User.findOne({
      'id': parseInt(userId)
    }, function(err, user) {
      if (err) {
        return done(err);
      }

      if (!user) {
        return done(null, false);
      }

      if (user.password != password) {
        return done(null, false);
      }

      return done(null, user);
    });
  });
}));

var returnStatusFunction = function(err) {
  if (err) {
    res.status(500).end(err);
  } else {
    res.status(200).end();
  }
};

// redirect successful login according to the user role
app.post('/login',
    passport.authenticate('local'),
    function(req, res) {
      // If this function gets called, authentication was successful.
      if (req.user.userRole == 'Admin') {
        res.redirect('/adminMain')
      } else if (req.user.userRole == 'Student') {
        res.redirect('/students')
      } else {
        // Shouldn't reach here, if so there is a bug in creating Users in the DB
        console.log("User " + user.id.toString + "has illegal role: " + req.user.userRole);
        res.redirect('/')
      }
          res.redirect('/users/' + req.user.username);
    });

// login - to check data
app.get('/', function (req, res) {
  res.render('enter.jade');
});

// TODO: uncomment this
////demand authentication from this point on
//app.all('*',require('connect-ensure-login').ensureLoggedIn('/login'),function(a,b,next){
//  next();
//});

//------------------------------------------Student-------------------------------------

// Students data page
app.get('/students', function (req, res) {
  res.render(); // TODO: Write the name of the file
});

//Students data request
app.get('/students/data', function (req, res) {
  dataBase.getStudentAttendance(req.user.id, res.json);
});

app.post('/addStudent', function (req, res) {
  dataBase.createStudent(req.body.id, req.body.classList, req.body.password, req.body.MACAddress, returnStatusFunction);
  console.log(req.body)
});


//------------------------------------------Lecturer-------------------------------------

// Students data page
app.get('/Lecturer', function (req, res) {
  res.render(); // TODO: Write the name of the file
});

//Students data request
app.get('/Lecturer/class', function (req, res) {
  if (typeof req.body.classIds !== 'undefined' && req.body.classIds.length > 0) {

  }

});

app.post('/addLecturer', function (req, res) {
  dataBase.createLecturer(req.body.id, req.body.classList, req.body.password, returnStatusFunction);
});

app.post('/addClass', function (req, res) {
  dataBase.createClass(req.body.id, req.body.studentList, req.body.lecturerId, req.body.roomId, req.body.schedule,
      returnStatusFunction);
});

//------------------------------------------Admin----------------------------------------

app.get('/adminMain', function (req, res) {
  res.render(); // TODO: Write the name of the file
});

app.get('admin/Students', function(req, res) {

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
    database.updateAttendances(returnClass, req.body.studentsMac, returnStatusFunction)
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
