const express = require("express");

const app = express();

// let mongoose = require("mongoose");

// const mongodb = require("mongodb");

// const ObjectID = mongodb.MongoClient;

const bodyParser = require("body-parser");
const path = require("path");
const swal = require("sweetalert");
// const ejs = require("ejs");
const config = require("config");
const morgan = require("morgan");
const session = require("express-session");
const MongoStore = require("connect-mongo")(session);
const databaseConnection = require("./Database/database");
const checkIfUserExists = require("./Middlewares/checkIfUserExists");

require("dotenv").config();

// don't show the log when it is test
if (config.util.getEnv("NODE_ENV" !== "test")) {
  // use morgan to log at command line
  app.use(morgan("combined"));// 'combined' outputs the Apache style LOGs
}

const port = process.env.PORT || 3000;

const get = require("./Routes/get");
const remove = require("./Routes/delete");
const post = require("./Routes/post");
const update = require("./Routes/update");

// serving static files
app.use(express.static(path.join(__dirname, "public")));

// making the static files available on /edit path
app.use("/edit", express.static(path.join(__dirname, "public")));

// setting the view engine and for server to look at the views folder
app.set("views", path.join(__dirname, "Views"));
app.set("view engine", "ejs");

// parse data from the form
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// database object
databaseConnection();

// get connecion object
const conn = databaseConnection();

// use sessions for tracking logins
app.use(session({
  secret: "work hard",
  resave: true,
  saveUninitialized: false,
  store: new MongoStore({
    mongooseConnection: conn,
  }),
}));
// check if user has been authenticated
app.use(
  ["/admin", "/scripts", "/users", "/new", "/edit/:title", "/singlepost/:title"],
  checkIfUserExists,
);

// use routes
app.use("/", get);
app.use("/", post);
app.use("/", remove);
app.use("/", update);

// catch 404 and forward to error handler
/*
app.use((req, res, next) => {
  // facilitate the right error message
  const err = new Error();
  //err.status = 404;
  next(err);
});
*/

// error handler
// define as the last app.use callback
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  // res.json(err.message);
  // res.json(err.message);
  swal("err.message");
  next();
});

if (!module.parent) {
  app.listen(port, () => {
    console.log(`listening on the port ${port}`);
  });
}

module.exports = app; // for testing

/** **********
 *
 *
 *
 * :) Dennis Kimutai
 *
 *
 *
 *********** */
