/**
 * Posts schema
 */

var mongoose = require('mongoose');

var postSchema=new mongoose.Schema({
  title: { type: String, required: true },
  body: String,
  _imageFromSearch: String,
 date : { type: Date, default: Date.now}
  });
  
  module.exports = mongoose.model('postmodel',postSchema);