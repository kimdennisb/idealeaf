/**
 * script to inject schema
 */

var mongoose = require('mongoose');

var scriptToInjectSchema=new mongoose.Schema({
  url : String
  });
  
  module.exports = mongoose.model('scriptToInjectModel',scriptToInjectSchema);