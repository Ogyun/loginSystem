const express = require('express');
const router = express.Router();
const Post = require('../models/post');
const config = require('../config/database');
const CryptoJS = require("crypto-js");

// new post
router.post('/post', (req, res, next) => {

  let newPost = new Post ({
    username: req.body.username,
    post: req.body.post,
    date: req.body.date,
    lastEdit: req.body.lastEdit
  });

  let encryptedPost = CryptoJS.AES.encrypt(JSON.stringify(newPost.post), config.secret);
  newPost.post = encryptedPost;

  Post.addPost(newPost, (err, post) => {
    if(err) {
      res.json({succes: false, msg:'Failed to register post'});
    } else {
      res.json({succes: true, msg:'Post registered'});
    }
  });

});

//getAllPosts
router.get('/getAllPosts', (req, res, next) => {
  Post.getAllPosts((err, posts) => {
    if (err)
    {
      res.json({succes: false, msg:'Failed to get posts'});
    }
    else
    {
      posts.forEach(e => {
        var bytes  = CryptoJS.AES.decrypt(e.post.toString(), config.secret);
        var decryptedData = bytes.toString(CryptoJS.enc.Utf8);
        e.post = decryptedData;
      })
      res.json({success: true, posts});
      };
  });
});

module.exports = router;
