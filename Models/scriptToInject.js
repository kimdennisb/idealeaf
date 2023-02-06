/**
 * schema for scripts injection
 */

const mongoose = require("mongoose");

const scriptToInjectSchema = new mongoose.Schema(
  {
    script: {
      type: String,
      required: true,
      unique: true,
    },
    placement: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("scriptToInjectModel", scriptToInjectSchema);
