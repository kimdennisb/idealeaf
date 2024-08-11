/* eslint-disable object-shorthand */
/* eslint-disable func-names */
/* eslint-disable quote-props */
/**
 * Posts schema
 */

const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    html: {
      type: String,
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    feature_image: {
      type: String,
    },
    feature_image_alt: {
      type: String,
    },
    visits: { type: Number, required: true },
    reference: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

// Sets the createdAt parameter equal to the current time
PostSchema.pre("save", (next) => {
  const now = new Date();
  if (!this.date) {
    this.date = now;
  }
  next();
});

// index postschema to enable text searching
PostSchema.index(
  {
    // eslint-disable-next-line quotes
    title: "text",
    // eslint-disable-next-line quotes
    plainTextBody: "text",
  },
  {
    weights: {
      title: 5,
      plainTextBody: 3,
    },
  }
);

// mongoose-partial-full-search

PostSchema.statics = {
  fullTextSearch: function (q) {
    return this.find(
      { $text: { $search: q, $caseSensitive: false } },
      { score: { $meta: "textScore" } }
    ).sort({ score: { $meta: "textScore" } });
  },
};

module.exports = mongoose.model("post", PostSchema);
