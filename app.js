// Imports
const express = require('express');
const mongoose = require('mongoose');
const config = require('./config/database');
const userRoute = require('./routes/userRoute');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');


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
staticServe = express.static(`${ __dirname }/public`);

// CORS Middleware
app.use(cors());

//Body Parser Middleware
app.use(bodyParser.json());

// Routes
app.use('/users', userRoute);
app.use("/", staticServe);

// Set port number
const port = process.env.PORT || 3000;

// Start server
app.listen(port, () => {
  console.log('Server startet on port ' + port);
});
