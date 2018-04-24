const md5 = require('md5');
var cron = require('node-cron');

let tokenArr = [];

cron.schedule('* * * * *', function(){
  console.log('running a task every minute');
  tokenArr.forEach( (e, index) => {
    if(e.expires < new Date()) {
      tokenArr.splice(index, 1)
    }
  });
});

module.exports = {

  generateTokens: function(user, secret) {
    let newToken = md5(user + secret),
    currentDate = new Date();
    //expireDate = currentDate.setHours(currentDate.getHours() + 1);
    expireDate = currentDate.setMinutes(currentDate.getMinutes() + 2);

    let tokenObj = {
      token : newToken,
      user : user,
      expires : expireDate
    };

    tokenArr.push(tokenObj);

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

  removeExpiredTokens: function() {

  },

  getAllTokens: function() {
    return tokenArr;
  }

};
