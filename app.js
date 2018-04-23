// Imports
const express = require('express');
const mongoose = require('mongoose');
const config = require('./config/database');
const userRoute = require('./routes/userRoute');

// DATABASE CONNECTION

// Promise libary
mongoose.Promise = require('bluebird');

// Connect To Database
mongoose.connect(config.database);

// On Connection
mongoose.connection.on('connected', () => {
  console.log('Connected to database ' + config.database)
});

// On Error
mongoose.connection.on('error', (err) => {
  console.log('Database error : ' + err);
});

// Set Static Folder
const app = express();
staticServe = express.static(`${ __dirname }/public`);

// Start Server
const port = process.env.PORT || 3000;

// Routes
app.use('/users', userRoute);

app.listen(port, () => {
  console.log('Server startet on port ' + port);
});

app.use("/", staticServe);
