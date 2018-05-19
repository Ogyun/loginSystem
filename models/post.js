const mongoose = require('mongoose');
const config = require('../config/database');

// Post Schema
const postSchema = mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  post: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now,
    required: true
  },
  checksum: {
    type: String,
    required: false
  }
});

const Post = module.exports = mongoose.model('Post', postSchema);

// Methods
module.exports.getPostByUsername = (username, callback) => {
  const query = {username: username};
  Post.findOne(query, callback);
}

module.exports.getPostById = (id, callback) => {
  Post.findById(id, callback);
}

module.exports.getAllPosts = (callback) => {
  Post.find({}, callback);
}

module.exports.addPost = (newPost, callback) => {
  newPost.save(callback);
}

module.exports.deletePostById = (postID, callback) => {
  const query = {_id: postID};
  Post.remove(query, callback);
}
