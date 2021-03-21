/**
 * script to inject schema
 */

const mongoose = require("mongoose");

const scriptToInjectSchema = new mongoose.Schema({
  url: String,
}, { timestamps: true });

module.exports = mongoose.model("scriptToInjectModel", scriptToInjectSchema);
