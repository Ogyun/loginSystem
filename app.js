// Imports
const express = require('express');
const mongoose = require('mongoose');
const config = require('./config/database');
const userRoute = require('./routes/userRoute');
const postRoute = require('./routes/postRoute');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const tokens = require('./tokens.js');
const CryptoJS = require("crypto-js");
const Post = require('./models/post');
// DATABASE CONNECTION

// Promise libary
mongoose.Promise = require('bluebird');

// Connect To Database
mongoose.connect(config.database);

// On Connection
mongoose.connection.on('connected', () => {
  console.log('Connected to database ' + config.database)
})

// On Error
mongoose.connection.on('error', (err) => {
  console.log('Database error : ' + err);
});

// Declare express variable
const app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);

// Set Static Folder
app.use(express.static(path.join(__dirname, './angular-src/dist')));

// CORS Middleware
app.use(cors());

//Body Parser Middleware
app.use(bodyParser.json());

// Routes
app.use('/users', userRoute);
app.use('/posts', postRoute);

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, './angular-src/dist/index.html'));
});

// Set port number
const port = process.env.PORT || 443;

// Start server
server.listen(port, () => {
  console.log('Server startet on port ' + port);
});

// IO Socket connection
io.use(function(socket, next){
  // Authentication
  if (socket.handshake.query && socket.handshake.query.token){
    if(tokens.verifyToken(socket.handshake.query.token)) {
      next();
    }
  }
  next(new Error('Authentication error'));
})

// Connection now authenticated to receive further events
.on('connection', function(socket) {
  console.log('new socket connection established')

  // On reciving a new message
  socket.on('send message', function (data) {
    let encryptedPost = CryptoJS.AES.encrypt(JSON.stringify(data.post), config.secret);

    let newPost = new Post ({
      username: data.username,
      post: data.post,
      date: data.date,
    });

    // Broadcast post to clients
    io.emit('receive message', newPost);
    // Encrypt post
    newPost.post = encryptedPost
    // Save post in db.
    Post.addPost(newPost, (err, post) => {
      if(err) throw err;
    });
  });
});
