/* eslint-disable prefer-destructuring */
const mongoose = require("mongoose");
// const MongoClient = require("mongodb").MongoClient;
// const fs = require("fs");
// const path = require("path");
const config = require("config");
const Role = require("../Models/Role");

// database options
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

const databaseConnection = () => {
  mongoose.connect(config.DBHost, options)
    .then(() => {
      console.log("Successfully connected to MongoDB");
      // eslint-disable-next-line no-use-before-define
      setUpRoles();
    })
    .catch((error) => {
      console.log(`Connection to MongoDB error ${error}`);
      process.exit();
    });
  const conn = mongoose.connection;
  //  conn.on("error", console.error.bind(console, "connection error"));
  return conn;
};

function setUpRoles() {
  Role.estimatedDocumentCount((error, count) => {
    if (!error && count === 0) {
    // add User role
      new Role({
        name: "User",
      }).save((err) => {
        if (err) {
          console.log("Error", err);
        }
        console.log("Added User to roles collection");
      });
      // add Admin role
      new Role({
        name: "Admin",
      }).save((err) => {
        if (err) {
          console.log("Error", err);
        }
        console.log("Added Admin to roles collection");
      });
    }
  });
}
module.exports = databaseConnection;
