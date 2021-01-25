/* eslint-disable object-shorthand */
/* eslint-disable consistent-return */
/* eslint-disable no-lonely-if */
/* eslint-disable prefer-destructuring */
/* eslint-disable import/newline-after-import */
const express = require("express");
// const { use } = require("./post");
const mongodb = require("mongodb");
const router = express.Router();
const mongoose = require("mongoose");
const { htmlToText } = require("html-to-text");
const config = require("config");
const siteName = config.siteName;
const siteDescription = config.description;
const cacheMiddleware = require("../Cache/cache");
const postmodel = require("../Models/postSchema");
const databaseConnection = require("../Database/database");
const ObjectID = mongodb.ObjectID;
// const fs = require("fs");
const scriptToInjectModel = require("../Models/scriptToInjectSchema");
const user = require("../Models/userSchema");

// call database function
const conn = databaseConnection();

// signUp page
router.get("/signup", (req, res) => {
  res.render("signUp.ejs");
});

// signIn page
router.get("/signin", (req, res) => {
  res.render("signIn.ejs");
});

// access user admin
// GET route after registering
router.get("/admin", (req, res, next) => {
  /*
find user using session stored
if no user is authorized,redirect to sign in page else fetch user data
  */
  user.findById(req.session.userId)
    .exec((error, authorizedUser) => {
      if (error) {
        next(error);
      }
      if (authorizedUser === null) {
        (res.redirect("/signin"));
      } else {
        postmodel.find({}, (err, data) => {
          if (err) {
            next(err);
          }

          res.render("admin.ejs", { data: data });
        });
      }
    });
});

// destroy session(deauthenticate user)
router.get("/logout", (req, res, next) => {
  if (req.session) {
    // delete session object
    req.session.destroy((err) => {
      if (err) {
        return next(err);
      }
      return res.redirect("/");
    });
  }
});

// forgot password
router.get("/forgot-password", (req, res) => {
  const hostName = req.headers.host;
  const siteURL = `${hostName}/forgot-password`;
  res.render("forgotPassword.ejs", { siteName, siteDescription, siteURL });
});

// new article
router.get("/new", (req, res) => {
  console.log("called");
  res.render("writeArticle.ejs");
});

// get injected scripts
router.get("/getinjectedscripts", (req, res) => {
  scriptToInjectModel.find({}, (err, scripts) => {
    if (err) res.send(500, err);
    res.send(scripts);
  });
});

// edit article
router.get("/edit/:header", (req, res) => {
  const editPathName = (req.params.header).split("-").join(" ");
  // console.log(editPathname)
  postmodel.findOne({ header: editPathName }, (err, data) => {
    if (err) res.send(500, err);
    res.render("editArticle.ejs", { data: data.item });
  });
});

// posts get route
router.get("/page/:page", cacheMiddleware(30), (req, res, next) => {
  // console.log(req.session)
  const perPage = 4;
  const page = req.params.page || 1;

  postmodel.find({})
    // eslint-disable-next-line quote-props
    .sort({ "date": -1 })
    .skip((perPage * page) - perPage)
    .limit(perPage)
    .exec((err, data) => {
      if (err) return next(err);
      // postmodel.count gets the number of entities stored
      postmodel.count().exec((error, count) => {
        if (error) return next(error);
        const hostName = req.headers.host;
        const siteURL = `${hostName}/page/${page}`;
        res.render("pages.ejs", {
          data,
          current: page,
          pages: Math.ceil(count / perPage),
          siteDescription,
          siteName,
          siteURL,
        });
      });
    });
});

// reset password with token
router.get("/reset/:token", (req, res, next) => {
  const query = {
    resetPasswordToken: req.params.token,
    resetPasswordExpires: { $gt: Date.now() },
  };
  user.findOne(query, (err, theuser) => {
    if (!theuser) {
      const error = new Error("Password reset token is invalid or has expired.");
      error.status = 400;
      return next(error);
    }
    res.render("newPassword.ejs");
  });
});

// view specific article

router.get("/article/:titleOfTheArticle", (req, res, next) => {
  // console.log(req.params.title)

  const titleOfTheArticle = (req.params.titleOfTheArticle).split("-").join(" ");
  postmodel.findOne({ title: titleOfTheArticle }, (err, article) => {
    if (err) {
      return next(err);
    }
    // console.log(article);
    const {
      id, title, body, _imageFromSearch, date,
    } = article;
    // eslint-disable-next-line no-undef
    // console.log(id, title, body, _imageFromSearch, date);
    const hostName = req.headers.host;
    const imageURL = hostName + _imageFromSearch;
    const siteURL = `${hostName}/${titleOfTheArticle}`;
    const description = htmlToText(body, { wordWrap: 130, baseElement: "p" });

    // BUILD THE RESPONSE NICELY
    const cleanArticle = {
      id, title, body, description, imageURL, siteURL, date, siteName,
    };
    // console.log(cleanArticle);
    // console.log(siteURL);
    // console.log(description);
    // console.log(req.headers);
    (_imageFromSearch === "noImageFound") ? res.render("viewArticleWithoutOGImage", { data: cleanArticle }) : res.render("viewArticle", { data: cleanArticle });
  });
});

// get first number of posts on the front page(4)
router.get("/", (req, res, next) => {
  postmodel.find({})
    // eslint-disable-next-line object-curly-spacing
    // eslint-disable-next-line quote-props
    .sort({ "date": -1 })
    .limit(4)
    .exec((err_, data) => {
      if (err_) res.send(500, err_);
      // eslint-disable-next-line no-unused-vars
      postmodel.count().exec((err, count) => {
        if (err) return next(err);
        // res.json(data) -during testing
        const siteURL = req.headers.host;

        res.render("home.ejs", {
          data: data, siteDescription, siteURL, siteName,
        });
      });
    });
});

/**
 * GET /image/:photoID
 */
router.get("/image/:photoID", (req, res, next) => {
  // get images from req.params.photoID object

  try {
    //  let photoID = new ObjectID(req.params.photoID);
    // console.log(photoID)
  } catch (err) {
    console.log(err);
    const error = new Error("Invalid ImageID in URL parameter. Must be a single String of 12 bytes or a string of 24 hex characters");
    error.status = 400;
    // pass the error to the error handler
    return next(error);
  }

  const bucket = new mongoose.mongo.GridFSBucket(conn.db, {
    bucketName: "photos",
  });

  const photoID = new ObjectID(req.params.photoID);
  const downloadStream = bucket.openDownloadStream(photoID);

  downloadStream.on("data", (chunk) => {
    res.write(chunk);
  });

  downloadStream.on("error", () => {
    res.sendStatus(404);
  });

  downloadStream.on("end", () => {
    res.end();
  });
});

module.exports = router;
