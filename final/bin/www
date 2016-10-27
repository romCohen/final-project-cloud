#!/usr/bin/env node

/**
 * Module dependencies.
 */

var app = require('../app');
var debug = require('debug')('final:server');
var http = require('http');
var DB = require('../DB.js');


/**
 * Get port from environment and store in Express.
 */
var port;

/**
 * Create HTTP server.
 */

var server;


dataBase = new DB();
dataBase.init(function () {
  console.log("DB ready");
  //fillDBTest();
  port = normalizePort(process.env.PORT || '3000');
  app.set('port', port);

  /**
   * Create HTTP server.
   */
  server = http.createServer(app);
  /**
   * Listen on provided port, on all network interfaces.
   */
  server.listen(port);
  server.on('error', onError);
  server.on('listening', onListening);
});


function fillDBTest() {
  dataBase.createLecturer(1, [1,2], "admin", function(err) {
    if (!err) {
      dataBase.createClass(6521, [], 1, "Canada", [{day:"monday", start:12, end:13},
        {day:"sunday", start:12, end:14}],
          function(err){
            if (!err) {
              dataBase.createStudent(10, [6521], "1234", "AS:ce:9e:8d:02:1d:e9",
                  function(err) {});
            }
          });
      }
  });
}

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debug('Listening on ' + bind);
}
