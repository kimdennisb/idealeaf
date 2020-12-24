/**
 * Posts schema
 */

var mongoose = require('mongoose');

var postSchema=new mongoose.Schema({
  header: {
      type:String,
      required:true
  },
  item: {
    type:String
  },
  _imageFromSearch: {
    type:String
  }
  });
  
  module.exports = mongoose.model('postmodel',postSchema);