const express = require('express');
const router = express.Router();
const User = require('../models/user');
const config = require('../config/database');
const tokens = require('../tokens.js');
const sanitize = require('../sanitize.js');
const multer = require('multer');
const crypto = require('crypto');
const path = require('path');
const mime = require('mime');

let storage = multer.diskStorage({
  destination: function(req, file,
    cb) {
    cb(null, './public/images/')
  },
  filename: function(req, file, cb) {
    crypto.pseudoRandomBytes(16, function(err, raw) {
      cb(null, raw.toString('hex') + Date.now() + '.' + mime.getExtension(file.mimetype));
    });
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 2000000
  },
  fileFilter: function(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
      return cb(new Error('Only image files are allowed!'));
    }
    cb(null, true);
  }
}).single('photo');


router.post('/register', (req, res, next) => {

  let newUser = new User({
    username: sanitize.encodeHTML(req.body.username),
    email: sanitize.encodeHTML(req.body.email),
    password: req.body.password
  });

  // check if user or email already exsist.
  if (!User.isUsernameAndEmailAvailable(newUser.username, newUser.email)) {
    return res.json({
      success: false,
      msg: 'Username or email already in use'
    })
  }

  // Add user
  User.addUser(newUser, (err, user) => {
    if (err) {
      res.json({
        success: false,
        msg: 'Failed to register user'
      });
    } else {
      res.json({
        success: true,
        msg: 'User registered'
      });
    }
  });
});

// Authenticate
router.post('/authenticate', (req, res, next) => {
  const username = sanitize.encodeHTML(req.body.username);
  const password = req.body.password;

  // Does user exsist
  User.getUserByUsername(username, (err, user) => {
    if (err) throw err;
    if (!user) {
      return res.json({
        success: false,
        msg: 'Wrong password or username'
      });
    }

    // Is user currently locked
    if (User.isLocked(user)) {
      return res.json({
        success: false,
        msg: 'Too many failed login attempts, account is locked untill: ' + new Date(user.lockUntil)
      })
    }

    // Does the password match
    User.comparePassword(password, user.password, (err, isMatch) => {
      if (err) throw err;
      if (isMatch) {

        User.resetLoginCount(user.username);

        const token = tokens.signUser(user);

        // Set cookies
        res.cookie('Auth', token, {
          maxAge: 2 * 60 * 60 * 1000,
          httpOnly: true
        });

        let userInfo = {
          id: user._id,
          email: user.email,
          username: user.username,
          profileIcon: user.profileIcon
        }

        res.cookie('User', JSON.stringify(userInfo), {
          maxAge: 2 * 60 * 60 * 1000,
          httpOnly: true
        });

        res.json({
          success: true,
          msg: 'You are logged in!'
        });
      } else {

        // Wrong password
        User.failedLogin(user);

        // Is user currently locked
        if (User.isLocked(user)) {
          return res.json({
            success: false,
            msg: 'Too many failed login attempts, account is locked untill: ' + new Date(user.lockUntil)
          })
        }

        return res.json({
          success: false,
          msg: 'Wrong password or username'
        });
      }
    });
  });
});

// Validiate a JWT token.
router.get('/validateToken', (req, res, next) => {
  const token = req.cookies.Auth
  if (tokens.verifyToken(token)) {
    res.json({
      success: true
    })
  } else {
    res.json({
      success: false
    })
  }
});

// Logout a user and destroy auth and user cookies
router.get('/logout', (req, res, next) => {
  res.clearCookie("Auth");
  res.clearCookie("User");

  res.json({
    success: true,
  })
})

// Get profile informartion from cookie
router.get('/profile', function(req, res, next) {
  if (req.cookies.Auth = !null && tokens.verifyToken(req.cookies.Auth)) {
    next();
  } else {
    res.send('Authorization failed!');
  }
}, (req, res, next) => {
  let userInfo = JSON.parse(req.cookies.User);

  res.json({
    username: userInfo.username,
    email: userInfo.username,
    profileIcon: userInfo.profileIcon
  })
});

// Upload a new profile picture
router.post('/fileupload', function(req, res, next) {
    if (req.cookies.Auth = !null && tokens.verifyToken(req.cookies.Auth)) {
      next();
    } else {
      res.send('Authorization failed!');
    }
  },
  function(req, res, next) {

    let userInfo = JSON.parse(req.cookies.User);

    upload(req, res, function(err) {
      if (err) {
        // An error occurred when uploading
        return res.status(422).send("an error occured - Remember only image files are allowed!")
      }
      // No error occured.
      let path = req.file.path;
      let imageName = (path.split('/')[2]);

      // set user profile image.
      User.changeUserProfile(userInfo.username, imageName, (err, updated) => {
        if (err) console.log(err)
      })

      userInfo.profileIcon = imageName;

      res.cookie('User', JSON.stringify(userInfo), {
        maxAge: 2 * 60 * 60 * 1000,
        httpOnly: true
      });

      return res.json({
        success: true,
        msg: 'Image has been updated!'
      });
    });
  })

module.exports = router;
