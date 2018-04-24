const md5 = require('md5');
let tokenArr = [];

module.exports = {

  generateTokens: function(user, secret) {
    newToken = md5(user + secret)

    var tokenObj = {
      token : newToken,
      user : user,
      expires : Date.now()
    };

    tokenArr.push(tokenObj);

    return newToken
  },

  verifyToken: function(testtoken) {
    let found = false;

    tokenArr.forEach(e => {
      if(e.token === testtoken) {
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
