#!/usr/bin/env node

/**
 * Module dependencies.
 */

var app = require('../app');
var debug = require('debug')('progressiveapp:server');
// var http = require('http');
var https = require('https');
var fs = require('fs-extra');


/**
 * Get port from environment and store in Express.
 */

var port = normalizePort(process.env.PORT || '3004');
app.set('port', port);

/**
 * Create HTTPs server.
 */
var options = {
    key: fs.readFileSync('./private_access/ca.key'),
    cert: fs.readFileSync('./private_access/ca.crt')
};

/**
 * Create HTTPs server using the options
 */
var server = https.createServer(options, app);
// var server = http.createServer(app);
var io = require('socket.io').listen(server);
io.on('connection', function(socket) {
  console.log("User connected");
  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
})
io.on('connection', function(socket){
  socket.on('chat message', function(msg){
    console.log('message: ' + msg);
    io.emit('chat message', msg)
  });
});

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

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
 * Event listener for HTTPs server "error" event.
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
 * Event listener for HTTPs server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debug('Listening on ' + bind);
}
