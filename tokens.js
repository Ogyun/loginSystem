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
      "iat": expireDate,
      "isAdmin" : false
    };

    //Check if the user is admin and change the user role to admin in the token
    if(user.isAdmin){
      payload.isAdmin = true;
    }

    let encryptedHeader = CryptoJS.AES.encrypt(JSON.stringify(header), config.secret);
    let encryptedPayload = CryptoJS.AES.encrypt(JSON.stringify(payload), config.secret);


    // Encode header and payload
    let h = Buffer.from(JSON.stringify(encryptedHeader.toString())).toString('base64');
    let p = Buffer.from(JSON.stringify(encryptedPayload.toString())).toString('base64');

    //Signature
    let signature = CryptoJS.HmacSHA256(h + '.' + p, config.secret);

    //Token
    let newToken = h + "." + p + "." + signature;


    return newToken
  },
  decodeToken: function(token){
    encodedHeader = token.split(".")[0];
    encodedPayload = token.split(".")[1];
    signature = token.split(".")[2];
    decodedPayload = JSON.parse(atob(encodedPayload));

    let decodedToken = {
      "encodedHeader":encodedHeader,
      "encodedPayload":encodedPayload,
      "signature":signature,
      "decodedPayload":decodedPayload
      }

    return decodedToken;
  },
  checkIfAdmin: function(token){
    let decodedToken = this.decodeToken(token);
    var bytes  = CryptoJS.AES.decrypt(decodedToken.decodedPayload, config.secret);
    var decryptedPayload = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    if(decryptedPayload.isAdmin){
      return true;
    } else{
      return false;
    }
  },
  verifyToken: function(token) {
    let decodedToken = this.decodeToken(token);
    var bytes  = CryptoJS.AES.decrypt(decodedToken.decodedPayload, config.secret);
    var decryptedPayload = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    let found = false;
    try {
      signatureCandidate = CryptoJS.HmacSHA256(decodedToken.encodedHeader + '.' + decodedToken.encodedPayload, config.secret).toString(CryptoJS.enc.Hex);
      if (signatureCandidate == decodedToken.signature && decryptedPayload.iat > Date.now()){
        found = true;
        return found;
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
