const config = require("config");
require("dotenv").config();

const express = require("express");

const app = express();
const bodyParser = require("body-parser");
const path = require("path");
//const config = require("config");
const morgan = require("morgan");
const session = require("express-session");
const MongoStore = require("connect-mongo")(session);
const databaseConnection = require("./Database/database");
const checkIfUserExists = require("./Middlewares/checkIfUserExists");
const checkRolesExisted = require("./Middlewares/checkRolesExisted");
//const addSchemaVersionProperty = require("./Migrations/user");
//const addUrlProperty = require("./Migrations/post");

require("dotenv").config();

// don't show the log when it is test
if (config.util.getEnv("NODE_ENV") !== "test") {
  // use morgan to log at command line
  app.use(morgan("combined")); // 'combined' outputs the Apache style LOGs
}

const port = process.env.PORT || 80;

const get = require("./Routes/get");
const remove = require("./Routes/delete");
const post = require("./Routes/post");
const update = require("./Routes/update");

//Indicates the app is behind a front-facing proxy, and to use the X-Forwarded-* headers to determine the connection and the IP address of the client.
app.enable("trust proxy");

// serving static files
app.use(express.static(path.join(__dirname, "Public")));
app.use(express.static(__dirname, { dotfiles: "allow" }));
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

// making the static files available on /edit path
//app.use("/edit", express.static(path.join(__dirname, "public")));

// setting the view engine and for server to look at the views folder
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// parse data from the form
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// database object
databaseConnection();

// get connection object
const conn = databaseConnection();

// use sessions for tracking logins
app.use(
  session({
    secret: "work hard",
    resave: true,
    saveUninitialized: false,
    store: new MongoStore({
      mongooseConnection: conn,
    }),
  })
);

// check if user has been authenticated
app.use(
  [
    "/admin/scripts",
    "/admin/posts",
    "/admin/users",
    "/admin/ipDevice",
    "/admin/new",
    "/edit/:id",
    "/singlepost/:title",
  ],
  [checkIfUserExists]
);

// check roles
app.use(["/admin/new", "/admin/posts", "/admin/users", "/admin/ipDevice"], checkRolesExisted);

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
  //res.json(err.message);

  if (err.status === 401) {
    const email = req.body.email;
    res.cookie("email", email, { expires: new Date(Date.now() + 9000000) });
    res.redirect("/session");
  }
  next();
});

if (!module.parent) {
  app.listen(port, () => {
    console.log(`listening on the port ${port}`);
  });
}

module.exports = app;

/************
 *
 *
 *
 * :) Dennis Kimutai (https://github.com/kimdennisb)
 *
 *
 *
 ************/
