/* eslint-disable prefer-destructuring */
const mongoose = require("mongoose");
// const MongoClient = require("mongodb").MongoClient;
// const fs = require("fs");
// const path = require("path");
const config = require("config");

// database options
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

const databaseConnection = () => {
  mongoose.connect(config.DBHost, options);
  const conn = mongoose.connection;
  conn.on("error", console.error.bind(console, "connection error"));
  return conn;
};

module.exports = databaseConnection;
