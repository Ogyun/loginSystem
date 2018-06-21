// Imports
const md5 = require('md5');
const config = require('./config/database');
const sha256 = require('sha256');
const cron = require('node-cron');
const atob = require('atob');
const CryptoJS = require("crypto-js");


// Exported methods
module.exports = {

  // Generate a new token valid for 1hour
  signUser: function(user) {

    const currentDate = new Date();
    const expireDate = currentDate.setHours(currentDate.getHours() + 1);


    // Header
    let header = {
      "alg": "HS256",
      "typ": "JWT"
    };
    // Payload
    let payload = {
      "sub": user._id,
      "name": user.username,
      "iat": expireDate
    };
    // Signature

    // Encode header and payload
    let h = Buffer.from(JSON.stringify(header)).toString('base64');
    let p = Buffer.from(JSON.stringify(payload)).toString('base64');

    //Signature
    let signature = CryptoJS.HmacSHA256(h + '.' + p, config.secret);

    //Token
    let newToken = h + "." + p + "." + signature;


    return newToken
  },
  verifyToken: function(token) {
    let found = false;
    try {

      encodedHeader = token.split(".")[0];
      encodedPayload = token.split(".")[1];
      signature = token.split(".")[2];
      signatureCandidate = CryptoJS.HmacSHA256(encodedHeader + '.' + encodedPayload, config.secret).toString(CryptoJS.enc.Hex);
      if (signatureCandidate == signature) {
        found = true;
      } else {
        console.log("token tampered!")
        found = false;


      }
      return found;
    } catch (err) {
      console.error("This is the error: "+ err);
      return found;

    }
  }

};
