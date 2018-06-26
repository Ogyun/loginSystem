const express = require('express');
const router = express.Router();
const Post = require('../models/post');
const config = require('../config/database');
const CryptoJS = require("crypto-js");
const tokens = require('../tokens.js');
const sha256 = require('sha256');

// Create a new post
router.post('/post', function(req, res, next) {
  let decodedToken = tokens.decodeToken(req.cookies.Auth);
  console.log(decodedToken)
  if(req.cookies.Auth =! null && tokens.verifyToken(decodedToken)) {
    next();
  } else {
    res.send('Authorization failed!');
  }
}, (req, res, next) => {

  let newPost = new Post ({
    username: req.body.username,
    post: req.body.post,
    date: req.body.date,
    checksum: sha256(req.body.username)
  });

  let encryptedPost = CryptoJS.AES.encrypt(JSON.stringify(newPost.post), config.secret);
  newPost.post = encryptedPost;

  Post.addPost(newPost, (err, post) => {
    if(err) {
      res.json({success: false, msg:'Failed to register post'});
    } else {
      res.json({success: true, msg:'Post registered'});
    }
  });

});

// Get all posts
router.get('/getAllPosts', function(req, res, next) {
  let token = req.cookies.Auth;
  if(token =! null && tokens.verifyToken(token)) {
    next();
  } else {
    res.send('Authorization failed!');
  }

  /*
  if(req.headers.authorization =! null && tokens.verifyToken(req.headers.authorization)) {
    next();
  } else {
    res.send('Authorization failed!');
  }
  */


}, (req, res, next) => {
  Post.getAllPosts((err, posts) => {
    if (err) {
      res.json({success: false, msg:'Failed to get posts'});
    }
    else {
      posts.forEach(e => {

        // Checksum
        if(!(e.checksum == sha256(e.post.toString()))) {
          e.post = '** corrupted post! **'
          return;
        }

        // Decrypt messages
        var bytes  = CryptoJS.AES.decrypt(e.post.toString(), config.secret);
        var decryptedData = bytes.toString(CryptoJS.enc.Utf8);
        e.post = decryptedData;
      })
      res.json({success: true, posts});
    };
  });
});

module.exports = router;
