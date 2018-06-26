const express = require('express');
const router = express.Router();
const User = require('../models/user');
const config = require('../config/database');
const tokens = require('../tokens.js');
const sanitize = require('../sanitize.js');
const cookieParser = require('cookie-parser');

// Register
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
    if (User.isLocked(user)) return res.json({
      success: false,
      msg: 'Too many failed login attempts, account is locked untill: ' + new Date(user.lockUntil)
    })

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

        // Wrong password
        User.failedLogin(user);
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


module.exports = router;
