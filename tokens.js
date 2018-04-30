// Imports
const md5 = require('md5');
var cron = require('node-cron');
const config = require('./config/database');
const sha256 = require('sha256');
// Token array
let tokenArr = [];

// Clean up task
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
  generateTokens: function() {
    currentDate = new Date();
    expireDate = currentDate.setHours(currentDate.getHours() + 1);
    //expireDate = currentDate.setMinutes(currentDate.getMinutes() + 2);

    // Header
    let header = { "alg" : "HS256", "typ" : "JWT"};
    // Payload
    let payload = { "sub" : 1234567890, "name" : "John Wick", "iat": 1516239022};
    // Secret
    let secret = sha256(config.secret);

    let h = Buffer.from(JSON.stringify(header)).toString('base64');
    let p = Buffer.from(JSON.stringify(payload)).toString('base64');

    let newToken = Buffer.from(JSON.stringify(header)).toString('base64') +
                  "." + Buffer.from(JSON.stringify(payload)).toString('base64') +
                  "." + secret;

    /*
    let tokenObj = {
      token : newToken,
      user : user,
      expires : expireDate
    };

    tokenArr.push(tokenObj);
    */

    return newToken
  },

  verifyToken: function(testtoken) {
    let found = false;

    tokenArr.forEach(e => {
      if(e.token === testtoken && e.expires > new Date()) {
        found = true;
      }
    })
    return found;
  },

  getAllTokens: function() {
    return tokenArr;
  }

};
