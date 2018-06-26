const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const config = require('../config/database');
var Request = require("request");

// User Schema
const userSchema = mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  profileIcon: {
    type: String,
    default : ""
  },
  loginAttempts: {
    type: Number,
    required: true,
    default: 0
  },
  lastLogin: {
    type: Number
  },
  lockUntil: {
    type: Number
  },
  pwdResetCode:{
    type: String
  },
  codeExpire:{
    type: Number
  },
  isAdmin:{
    type:Boolean,
    required: true,
    default: false
  }
});

const User = module.exports = mongoose.model('User', userSchema);

// Methods
module.exports.isLocked = (user) => {
  if(user.lockUntil < Date.now() || user.lockUntil == null) return false;
  else return true;
}

module.exports.failedLogin = (user) => {

  let currentDate = new Date();

  if(user.loginAttempts == 3) {
      User.update({username : user.username}, {lockUntil : currentDate.setMinutes(currentDate.getMinutes() + 30)}, (err, res) => {
        if (err) throw err
        else return true;
      });
  }

  else if(user.lastLogin > currentDate.setMinutes(currentDate.getMinutes() - 5)) {
    User.update({username : user.username}, {$inc: {loginAttempts: 1}}, (err, res) => {
      if(err) throw err
      else User.updateLogin(user.username)
    })
  }
    else {
      User.update({username : user.username}, {loginAttempts: 1}, (err, res) => {
        if(err) throw err
        else User.updateLogin(user.username)
      })
  }
}

module.exports.resetLoginCount = (username) => {
  User.update({username : username}, {loginAttempts: 0}, (err, res) => {
    if(err) throw err
    else return true;
  })
}

module.exports.updateLogin = (username) => {
    User.update({username : username}, {lastLogin : Date.now()}, (err, res) => {
      if(err) throw err
      else return true;
    })
}

module.exports.getUserById = (id, callback) => {
  User.findById(id, callback);
}

module.exports.getUserByUsername = (username, callback) => {
  const query = {username: username};
  User.findOne(query, callback);
}

module.exports.getUserByEmail = (email, callback) => {
  const query = {email: email};
  User.findOne(query, callback);
}

module.exports.addUser = function(newUser, callback) {
  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(newUser.password, salt, (err, hash) => {
      if (err) throw err;
      newUser.password = hash;
      newUser.save(callback);
    });
  });
}

module.exports.deleteUserByUsername = (username, callback) =>  {
  const query = {username: username};
  User.remove(query, callback);
}

module.exports.getAllUsers = (callback) => {
  //const query = {isAdmin:{$gte:true}};
  const query = {isAdmin:false};
  User.find(query, callback);
}

module.exports.comparePassword = function(candidatePassword, hash, callback) {
  bcrypt.compare(candidatePassword, hash, (err, isMatch) => {
    if(err) throw err
    callback(null, isMatch);
  });
};

module.exports.updatePassword = function(user, callback) {
  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(user.password, salt, (err, hash) => {
      if (err) throw err;
      else {
        let query = {
          username: user.username
        };
        User.update(query, {password: hash, $unset: { pwdResetCode:"", codeExpire:"" }}, callback);

      }
    });

  });
}
module.exports.verifyResetCode = (code, callback) => {
  const query = { pwdResetCode: code};
  User.findOne(query, callback);
}

module.exports.isCodeExpired = (user) => {
  if(Date.now() > user.codeExpire ) return true;
  else return false;
}

module.exports.resetExpireCode = function(user,callback){
  let query = {
    username: user.username
  };
  User.update(query, {$unset: { pwdResetCode:"", codeExpire:"" }}, callback);
}

module.exports.validatePassword = function(password){
    const re = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/;
    return re.test(password);
}

module.exports.validateEmail = function(email){
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}
module.exports.callEmailApi = function(mail, callback){
  Request.post({
    "headers": { "content-type": "application/json" },
    "url": "http://localhost:1598/api/Mail/sendMail",
    "body": JSON.stringify(
      {
        To: mail.To,
        Body: mail.Body,
        Subject: mail.Subject
    })
}, callback
  );
}

module.exports.setPwdResetCode = function(user, callback) {
    let currentDate = new Date();
        let query = {
          username: user.username
        };
        User.update(query, {pwdResetCode: user.pwdResetCode, codeExpire: currentDate.setMinutes(currentDate.getMinutes() + 10)}, callback);

}
