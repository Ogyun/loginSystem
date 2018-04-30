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
const authGuard = require('./authGuard');

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
const port = process.env.PORT || 3000;

// Start server
app.listen(port, () => {
  console.log('Server startet on port ' + port);
});
