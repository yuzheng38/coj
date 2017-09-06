const express = require('express');
const app = express();

const mongoose = require('mongoose');
mongoose.connect('mongodb://user:user@ds161742.mlab.com:61742/cs503-yz');

const restRouter = require('./routes/rest');
const indexRouter = require('./routes/index');

// handling static files.
const path = require('path');
app.use(express.static(path.join(__dirname, '../public/')));

app.use('/', indexRouter);

app.use('/api/v1', restRouter);

// this is for api/v1/problems or problems/id
app.use(function(req, res) {
  res.sendFile('index.html', {root: path.join(__dirname, '../public/')});
});

const http = require('http');
const io = require('socket.io')();

const editorSocketService = require('./services/editorSocketService.js')(io);
const server = http.createServer(app);
io.attach(server);
server.listen(3000);
server.on('error', onError);
server.on('listening', onListening);


function onError(error){
  throw error;
}

function onListening(){
  const address = server.address();
  const bind = (typeof address === 'string' ? 'pipe ' + address : 'port ' + address.port);
  console.log('Listening here on ' + bind);
}