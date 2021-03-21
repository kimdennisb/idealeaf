/* eslint-disable object-shorthand */
/* eslint-disable func-names */
/* eslint-disable quote-props */
/**
 * Posts schema
 */

const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  body: {
    type: String,
    required: true,
  },
  plainTextBody: {
    type: String,
    required: true,
  },
  _imageFromSearch: String,
  date: { type: Date, default: Date.now },
  visits: { type: Number, required: true },
});

// Sets the createdAt parameter equal to the current time
postSchema.pre("save", (next) => {
  const now = new Date();
  if (!this.date) {
    this.date = now;
  }
  next();
});

// index postschema to enable text searching
postSchema.index({
  // eslint-disable-next-line quotes
  title: 'text',
  // eslint-disable-next-line quotes
  plainTextBody: 'text',
}, {
  weights: {
    title: 5,
    plainTextBody: 3,
  },
});

// mongoose-partial-full-search

postSchema.statics = {
  /*
  searchPartial: function (q, callback) {
    return this.find({
      $or: [
        { "title": new RegExp(q, "gi") },
        { "plainTextBody": new RegExp(q, "gi") },
      ],
    }, callback);
  },

  searchFull: function (q, callback) {
    return this.find({
      $text: { $search: q, $caseSensitive: false },
    }, callback);
  },

  search: function (q, callback) {
  // eslint-disable-next-line consistent-return
    this.searchFull(q, (err, data) => {
      if (err) return callback(err, data);
      if (!err && data.length) return callback(err, data);
      if (!err && data.length === 0) return this.searchPartial(q, callback);
    });
  },
  */
  fullTextSearch: function (q) {
    return this.find({ $text: { $search: q, $caseSensitive: false } },
      { score: { $meta: "textScore" } })
      .sort({ score: { $meta: "textScore" } });
  },
};

module.exports = mongoose.model("postmodel", postSchema);
