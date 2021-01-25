/**
 * Posts schema
 */

const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  title: String,
  body: String,
  _imageFromSearch: String,
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model("postmodel", postSchema);
