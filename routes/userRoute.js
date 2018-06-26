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
const cookieParser = require('cookie-parser');

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

  const username = sanitize.encodeHTML(req.body.username);
  const email = sanitize.encodeHTML(req.body.email);
  const password = req.body.password;



  // check if user or email already exsist.
  // dobbel check if password is 'strong' and email is correct format
  if (!username || !email || !password) {
    return res.json({
      success: false,
      msg: 'All fields must be filled out'
    });
  } else {
    if (!User.validateEmail(email)){
      return res.json({
      success: false,
      msg: 'Please use a valid email address'
    });
  }
  if (!User.validatePassword(password)){
    return res.json({
    success: false,
    msg: "Password must contain a number, lower and uppercase letter and be atleast 8 characters long "
  });
  }

  let newUser = new User({
    username: username,
    email: email,
    password: password
  });


  User.getUserByUsername(newUser.username, (err, user) => {
      if (err) throw err

      // check if username is avaiable
      if (user != null) {
        return res.json({
          success: false,
          msg: 'username already in use'
        })
      } else {

        // check if email is avaiable
        User.getUserByEmail(req.body.email, (err, email) => {
          if (err) throw err
          if (email != null) {
            return res.json({
              success: false,
              msg: 'email already in use'
            })
          }
        })
      }
    })

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
}
});

// Authenticate
router.post('/authenticate', (req, res, next) => {
  const username = sanitize.encodeHTML(req.body.username);
  const password = req.body.password;

  if (!username || !password) {
    return res.json({
      success: false,
      msg: 'All fields must be filled out'
    });
  } else {
  if (User.validatePassword(password)){
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
  } else {
    return res.json({
      success: false,
      msg: "Password must contain a number, lower and uppercase letter and be atleast 8 characters long "
    });
  }
}
});

// Validiate a JWT token.
router.get('/validateToken', (req, res, next) => {
  let token = req.cookies.Auth
  if (tokens.verifyToken(token)) {
    res.json({
      success: true,
    })
  } else {
    res.json({
      success: false
    })
  }
});

router.get('/validateAdmin', (req, res, next) => {
  let token = req.cookies.Auth
  if (tokens.verifyToken(token) && tokens.checkIfAdmin(token)) {
    res.json({
      success: true,
    })
  } else {
    res.json({
      success: false
    })
  }
});

//Verify password reset code and change password
router.post('/changePassword', (req, res, next) => {
  const code = sanitize.encodeHTML(req.body.code);
  const newPassword = sanitize.encodeHTML(req.body.newPassword);
  const confirmPassword = sanitize.encodeHTML(req.body.confirmPassword);

  if (!code || !newPassword || !confirmPassword) {
    return res.json({
      success: false,
      msg: 'All fields must be filled out'
    });
  } else {
    User.verifyResetCode(code, (err, user) => {
      if (err) throw err;
      if (!user) {
        return res.json({
          success: false,
          msg: 'Code is wrong or expired'
        });
      } else {
        if (User.isCodeExpired(user)) {
          User.resetExpireCode(user, (err, response) => {
            if (err || response.nModified == 0) {
              res.json({
                success: false,
                msg: 'Something went wrong' //Failed to delete pwdResetCode and codeExpire
              });
            } else {
              res.json({
                success: false,
                msg: 'Code is expired' //when code exist but it is expired
              });
            }
          });
        } else {
          if (User.validatePassword(newPassword) && User.validatePassword(confirmPassword)) {
            if (newPassword === confirmPassword) {
              user.password = newPassword;
              User.updatePassword(user, (err, user) => {
                if (err) {
                  res.json({
                    success: false,
                    msg: 'Failed to change password'
                  });
                } else {

                  res.json({
                    success: true,
                    msg: 'Password is successfully changed'
                  });
                }
              });
            } else {
              return res.json({
                success: false,
                msg: 'Please type the same password for both fields'
              });
            }
          } else {
            return res.json({
              success: false,
              msg: "Password must contain a number, lower and uppercase letter and be atleast 8 characters long "
            });
          }
        }
      }
    });
  }
});

//Route for sending pasword reset code
router.post('/forgotPassword', (req, res, next) => {
  let email = sanitize.encodeHTML(req.body.email);
  if (User.validateEmail(email)) {
    User.getUserByEmail(email, (err, user) => {
      if (err) throw err;
      if (!user) {
        return res.json({
          success: false,
          msg: 'No user with this email exist'  // return res.redirect('/forgotPassword');
        });
      } else {
        let randomCode = Math.random().toString(36).slice(-8);
        console.log(randomCode);
        user.pwdResetCode = randomCode;
        User.setPwdResetCode(user, (err, response) => {
          if (err || response.nModified == 0) {
            res.json({
              success: false,
              msg: 'Failed to set pwdResetCode'
            });
          } else {

            let mail = {
              To: user.email,
              Body: "This is your password reset code: " + user.pwdResetCode,
              Subject: "Noreply Password Reset"
            }

            User.callEmailApi(mail, (error, response, body) => {
              if (error || response.statusCode == 400) {
                res.json({
                  success: false,
                  msg: 'An error occured'
                });
              } else {
                res.json({
                  success: true,
                  msg: 'Password reset code is successfully sent'
                });
              }
            });
          }
        });

      }
    });
  } else {
    res.json({
      success: false,
      msg: 'Please use a valid email address'
    });
  }
});

// Get all users
router.get('/getAllUsers', function(req, res, next) {
  if(req.cookies.Auth =! null && tokens.verifyToken(req.cookies.Auth) && tokens.checkIfAdmin(req.cookies.Auth)) {
    next();
  } else {
    res.send('Authorization failed!');
  }

}, (req, res, next) => {
  User.getAllUsers((err, users) => {
    if (err) {
      res.json({succes: false, msg:'Failed to get users'});
    }
    else {
      res.json({success: true, users});
    };
  });
});

// Delete user
router.post('/deleteUser', function(req, res, next) {
  if(req.cookies.Auth =! null && tokens.verifyToken(req.cookies.Auth) && tokens.checkIfAdmin(req.cookies.Auth)) {
    next();
  } else {
    res.send('Authorization failed!');
  }

}, (req, res, next) => {
  const username = req.body.username;
  User.deleteUserByUsername(username,(err, users) => {
    if (err) {
      res.json({succes: false, msg:'Failed to delete user'});
    }
    else {
      res.json({success: true, msg:'User is successfully deleted'});
    };
  });
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
