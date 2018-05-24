// Imports
const md5 = require('md5');
const config = require('./config/database');
const sha256 = require('sha256');
const cron = require('node-cron');
const atob = require('atob');
const CryptoJS = require("crypto-js");

// Token array
let tokenArr = [];

// Clean up dead tokens scheduled task
cron.schedule('* * * * *', function(){
  console.log('running a task every minute');
  tokenArr.forEach( (e, index) => {
    if(e.expires <  new Date()) {
      tokenArr.splice(index, 1)
    }
  });
});

// Exported methods
module.exports = {

  // Generate a new token valid for 1hour
  signUser: function(user) {

    const currentDate = new Date();
    const expireDate = currentDate.setHours(currentDate.getHours() + 1);


    // Header
    let header = { "alg" : "HS256", "typ" : "JWT"};
    // Payload
    let payload = { "sub" : user._id, "name" : user.username, "iat": expireDate};
    // Signature

    // Encode token
    let h = Buffer.from(JSON.stringify(header)).toString('base64');
    let p = Buffer.from(JSON.stringify(payload)).toString('base64');
    let signature = CryptoJS.HmacSHA256(h + '.' + p, config.secret);

    let newToken = Buffer.from(JSON.stringify(header)).toString('base64') +
                  "." + Buffer.from(JSON.stringify(payload)).toString('base64') +
                  "." + signature;

    tokenArr.push(newToken)
    return newToken
  },

  verifyToken: function(token) {
    let found = false;
    tokenArr.forEach(e => {
      if(e === token) {
        payload = JSON.parse(atob(token.split(".")[1]));
        if (payload.iat > Date.now()) {
          found = true;
        } else {
          // remove dead token
        }
      }
    })
    return found;
  }

};
