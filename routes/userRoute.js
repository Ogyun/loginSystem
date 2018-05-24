const express = require('express');
const router = express.Router();
const User = require('../models/user');
const config = require('../config/database');
const tokens = require('../tokens.js');

// Register
router.post('/register', (req, res, next) => {
  let newUser = new User({
    username: req.body.username,
    email: req.body.email,
    password: req.body.password
  });

  User.addUser(newUser, (err, user) => {
    if(err) {
      res.json({success: false, msg:'Failed to register user'});
    } else {
      res.json({success: true, msg:'User registered'});
    }
  });
});

// Authenticate
router.post('/authenticate', (req, res, next) => {
  const username = req.body.username;
  const password = req.body.password;


  User.getUserByUsername(username, (err, user) => {
    if(err) throw err;
    if(!user) {
      return res.json({success: false, msg: 'Wrong password or username'});
    }

    else {

      if(User.isLocked(user)) return res.json({success: false, msg: 'Too many failed login attempts, account is locked untill: ' + new Date(user.lockUntil)})

      User.comparePassword(password, user.password, (err, isMatch) => {
        if(err) throw err;
        if(isMatch) {

          User.resetLoginCount(user.username);
          const token = tokens.signUser(user);

          res.json({
            success: true,
            token: token,
            user: {
              id: user._id,
              email: user.email,
              username: user.username
            }
          });
        } else {
          User.failedLogin(user);
          return res.json({success: false, msg: 'Wrong password or username'});
        }
      });
    }
  });
});

router.post('/validateToken', (req, res, next) => {
  const token = req.body.token
  if(tokens.verifyToken(token)) {
    return res.json({success: true})
  } else {
    return res.json({success: false})
  }
});

module.exports = router;
