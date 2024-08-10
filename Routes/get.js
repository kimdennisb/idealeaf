/* eslint-disable eqeqeq */
/* eslint-disable object-shorthand */
/* eslint-disable consistent-return */
/* eslint-disable no-lonely-if */
/* eslint-disable import/newline-after-import */
const express = require("express");
const mongodb = require("mongodb");
const router = express.Router();
const mongoose = require("mongoose");
const sharp = require("sharp");
const { htmlToText } = require("html-to-text");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const config = require("config");
const siteName = config.siteName;
const siteDescription = config.description;
const cacheMiddleware = require("../Cache/cache");
const postModel = require("../Models/Post");
const databaseConnection = require("../Database/database");
const ObjectID = mongodb.ObjectID;
const scriptToInjectModel = require("../Models/ScriptToInject");
const userModel = require("../Models/User");
const ipDeviceModel = require("../Models/IpDevice");
const cookieReader = require("../Middlewares/cookieReader");
const softRedirects = require("../Middlewares/softRedirects");
const formatDate = require("../Helpers/formatDate");
const ipDevice = require("../Middlewares/ipDevice");

// call database function
const conn = databaseConnection();

// signUp page
router.get("/signup", softRedirects, (req, res) => {
  res.render("signUp.ejs", { siteName, siteDescription });
});

// signIn page
router.get("/signin", softRedirects, (req, res) => {
  res.render("signIn.ejs", { siteName, siteDescription });
});

//session page(shows when password or email is wrong)
router.get("/session", cookieReader, (req, res) => {
  if (res.locals.cookies.email) {
    const filledEmail = res.locals.cookies.email;
    res.clearCookie("email");
    res.render("session.ejs", { siteName, siteDescription, filledEmail });
  } else {
    res.redirect("/signin");
  }
});

// access user admin
// GET route after registering
router.get("/admin/posts", (req, res, next) => {
  postModel.find({}, (err, data) => {
    if (err) {
      next(err);
    }
    res.render("posts.ejs", { data: data, siteName, siteDescription });
  });
});

// access list of users
router.get("/admin/users", (req, res, next) => {
  userModel.find({}, (err, data) => {
    if (err) {
      next(err);
    }
    res.render("users.ejs", { data: data, siteName, siteDescription });
  });
});

// access list of scripts
router.get("/admin/scripts", (req, res, next) => {
  scriptToInjectModel.find({}, (err, data) => {
    if (err) {
      next(err);
    }
    res.render("scripts.ejs", { data: data, siteName, siteDescription });
  });
});

// code injection page
router.get("/admin/codeinjection", (req, res) => {
  res.render("codeInjection.ejs", { siteName, siteDescription });
});

// ip device capture page
router.get("/admin/ipDevice", (req, res) => {
  res.render("ipDevice.ejs", { siteName, siteDescription });
});

router.get("/data", (req, res, next) => {
  let query = req.query.q;

  query === "posts"
    ? postModel.find({}, (err, data) => {
      if (err) {
        next(err);
      }
      res.json(data);
    })
    : query === "users"
      ? userModel.find({}, (err, data) => {
        if (err) {
          next(err);
        }
        res.json(data);
      })
      : query === "scripts"
        ? scriptToInjectModel.find({}, (err, data) => {
          if (err) {
            next(err);
          }
          res.json(data);
        })
        : query === "ipDevice"
          ? ipDeviceModel.find({}, (err, data) => {
            if (err) {
              next(err);
            }
            res.json(data);
          })
          : null;
});

// destroy session(deauthenticate user)
router.get("/logout", (req, res, next) => {
  // delete cookie
  // res.clearCookie("loggedIn");
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

// new article(check if user is signed in before redirecting)
router.get("/admin/new", (req, res, next) => {
  res.render("writeArticle.ejs", { siteName, siteDescription });
});

// get injected scripts
router.get("/getinjectedscripts", (req, res, next) => {
  scriptToInjectModel.find({}, (err, scripts) => {
    //if (err) res.send(500, err);

    if (err) next(err);
    res.send(scripts);
  });
});

// edit article
router.get("/admin/edit/:id", (req, res, next) => {
  const id = req.params.id;
  postModel.findOne({ _id: id }, (err, data) => {
    if (err) {
      next(err);
    }
    const { title, html, feature_image, feature_image_alt } = data;
    const dom = new JSDOM(html);
    const document = dom.window.document;

    const images = Array.from(document.querySelectorAll("img"));
    images.forEach((image) => {
      const imageURL = image.src.split("?")[0];

      const src = `${imageURL}?w=319`;
      const srcset = `${imageURL}?w=239 239w,${imageURL}?w=319 319w,${imageURL}?w=468 468w,${imageURL}?w=512 512w,${imageURL}?w=612 612w,${imageURL}?w=687 687w`;
      const sizes = `(min-width: 1460px) 612px, (min-width: 860px) calc(38.97vw + 51px), (min-width: 800px) 65vw, (min-width: 620px) 87.5vw, calc(88vw - 60px)`;

      image.setAttribute("src", src);
      image.setAttribute("srcset", srcset);
      image.setAttribute("sizes", sizes);
    });

    const parentFigure = document.querySelectorAll("[role='group']");
    const siblingFigure = document.querySelectorAll("[role='group'] figure");

    parentFigure.forEach((figure) =>
      figure.setAttribute("differential", "old")
    );

    siblingFigure.forEach((figure) => {
      figure.setAttribute("class", "inner-cover");
      figure.removeAttribute("style");
    });

    const serializedDoc = document.querySelector("body").innerHTML;

    // let featureImage = (feature_image = "" ? "" : feature_image);
    let fineData = {
      title: title,
      html: serializedDoc,
      featureimage: feature_image || "",
      featureimagealt: feature_image_alt,
    };

    res.render("editArticle.ejs", {
      data: fineData,
      siteName,
      siteDescription,
    });
  });
});

// posts get route
router.get("/page/:page", cacheMiddleware(30), (req, res, next) => {
  // console.log(req.session)
  const perPage = 4;
  const page = req.params.page || 1;

  postModel
    .find({})
    // eslint-disable-next-line quote-props
    .sort({ createdAt: -1 })
    .skip(perPage * page - perPage)
    .limit(perPage)
    .exec((err, data) => {
      if (err) return next(err);
      // postmodel.count gets the number of entities stored
      postModel.count().exec((error, count) => {
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

// view specific article
router.get(
  "/article/:referenceOfTheArticle",
  cacheMiddleware(30),
  ipDevice,
  (req, res, next) => {
    const referenceOfTheArticle = req.params.referenceOfTheArticle;

    // handle views count by incrementing visitors count
    const filter = { reference: referenceOfTheArticle };
    const update = {
      $inc: {
        visits: 1,
      },
    };

    postModel.findOneAndUpdate(filter, update, (err, article) => {
      if (err) {
        next(err);
      }

      let {
        // eslint-disable-next-line camelcase
        _id: id,
        title,
        html,
        text,
        feature_image,
        visits,
        createdAt,
        updatedAt,
        reference,
      } = article;

      const hostName = req.headers.host;
      const protocol = req.protocol;

      // eslint-disable-next-line camelcase
      const featureimage = feature_image;
      const siteURL = `${hostName}/article/${reference}`;
      const description = htmlToText(html, { wordWrap: 130, baseElement: "p" });
      const dom = new JSDOM(html);
      const document = dom.window.document;

      const images = Array.from(document.querySelectorAll("img"));

      images.forEach((image) => {
        const imageURL = image.src.split("?")[0];
        const src = `${protocol}://${hostName}${imageURL}?w=319`;
        const srcset = `${protocol}://${hostName}${imageURL}?w=239 239w,${protocol}://${hostName}${imageURL}?w=319 319w,${protocol}://${hostName}${imageURL}?w=468 468w,${protocol}://${hostName}${imageURL}?w=512 512w,${protocol}://${hostName}${imageURL}?w=612 612w,${protocol}://${hostName}${imageURL}?w=687 687w`;
        const sizes = `(min-width: 1460px) 612px, (min-width: 860px) calc(38.97vw + 51px), (min-width: 800px) 65vw, (min-width: 620px) 87.5vw, calc(88vw - 60px)`;

        image.setAttribute("src", src);
        image.setAttribute("srcset", srcset);
        image.setAttribute("sizes", sizes);

        //avoid content layout shifts
        const height = (319 * 0.5625).toString();
        image.setAttribute("width", "319");
        image.setAttribute("height", height);
      });

      const parentFigure = document.querySelectorAll("[role='group'] figure");
      parentFigure.forEach((figure) => figure.removeAttribute("style"));

      const serializedDoc = document.querySelector("body").innerHTML;

      const createdAtDate = formatDate(createdAt);
      const updatedAtDate = formatDate(updatedAt);

      // BUILD THE RESPONSE NICELY
      let cleanArticle = {
        id,
        title,
        html: serializedDoc,
        text,
        description,
        featureimage,
        siteURL,
        createdAtDate,
        updatedAtDate,
        siteName,
        visits,
        reference,
      };
      // eslint-disable-next-line camelcase
      feature_image === ""
        ? res.render("viewArticleWithoutOGImage", {
          data: cleanArticle,
          siteName,
        })
        : res.render("viewArticle", { data: cleanArticle, siteName });
    });
  }
);

// get first number of posts on the front page(4)
router.get("/", cacheMiddleware(30), ipDevice, (req, res, next) => {
  if (!req.query.s) {
    postModel
      .find({})
      // eslint-disable-next-line object-curly-spacing
      // eslint-disable-next-line quote-props
      .sort({ createdAt: -1 })
      .limit(4)
      .exec((err_, data) => {
        if (err_) res.send(500, err_);
        // eslint-disable-next-line no-unused-vars
        postModel.count().exec((err, count) => {
          if (err) return next(err);

          const siteURL = req.headers.host;
          res.render("home.ejs", {
            data: data,
            siteDescription,
            siteURL,
            siteName,
          });
        });
      });
  }
});

// search posts page
router.get("/search", (req, res) => {
  if (!req.query.s) {
    res.render("search.ejs", { siteName, siteDescription });
  } else {
    res.render("search.ejs", { siteName, siteDescription });
  }
});

// get posts that have been searched
router.get("/getsearch", (req, res, next) => {
  postModel.fullTextSearch(req.query.s).exec((err, results) => {
    if (err) {
      next(err);
    }
    res.status(200).json(results);
  });
});

router.get("/image/:imageID", (req, res, next) => {
  const imageID = req.params.imageID;
  const width = Number(req.query.w) || 184;

  try {
    var photoID = new ObjectID(imageID);
  } catch (err) {
    const error = new Error(
      "Invalid ImageID in URL parameter. Must be a single String of 12 bytes or a string of 24 hex characters"
    );
    error.status = 400;
    // pass the error to the error handler(400:Bad request)
    return next(error);
  }

  const bucket = new mongoose.mongo.GridFSBucket(conn.db, {
    bucketName: "photos",
  });

  const downloadStream = bucket.openDownloadStream(photoID);

  let buffer = [];
  downloadStream.on("data", (chunk) => {
    buffer.push(chunk);
  });

  downloadStream.on("error", () => {
    res.sendStatus(404);
  });

  downloadStream.on("end", async () => {
    const completeBuffer = Buffer.concat(buffer);

    await sharp(completeBuffer)
      .resize({
        width: width,
        height: Math.floor(width * 0.5625),
      })
      .jpeg({ quality: 80 })
      .toBuffer()
      .then((buffer) => {
        res.write(buffer);
      });
    res.end();
  });
});

/**
 * GET /image/:photoID
 * This route is not currently used
 */
router.get("/image-asset/:photoID", cacheMiddleware(30), (req, res, next) => {
  // get images from req.params.photoID object

  try {
    var photoID = new ObjectID(req.params.photoID);
  } catch (err) {
    const error = new Error(
      "Invalid ImageID in URL parameter. Must be a single String of 12 bytes or a string of 24 hex characters"
    );
    error.status = 400;
    // pass the error to the error handler
    return next(error);
  }

  const bucket = new mongoose.mongo.GridFSBucket(conn.db, {
    bucketName: "photos",
  });

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

router.get("/posts/:page", cacheMiddleware(30), (req, res, next) => {
  const perPage = 4;
  const page = req.params.page || 1;

  postModel
    .find({})
    .sort({ createdAt: -1 })
    .skip(perPage * page - perPage)
    .limit(perPage)
    .exec((err, posts) => {
      if (err) return next(err);

      postModel.count().exec((error, count) => {
        if (error) return next(error);

        res.status(200).json({
          posts: posts,
          current: page,
          pages: Math.ceil(count / perPage),
        });
      });
    });
});

// verify reset password token
router.get("/reset/:token", (req, res, next) => {
  //console.log(req.params.token);
  const query = { resetLink: req.params.token };

  user.findOne(query, (err, theuser) => {
    if (err) next(err);

    if (!theuser) {
      const error = new Error(
        "Password reset token is invalid or has expired."
      );
      error.status = 400;
      return next(error);
    }
    res.render("newPassword.ejs", { siteName, siteDescription });
  });
});

/* route for fetch */
// gets view for a single post
router.get("/post/:id", cacheMiddleware(30), (req, res, next) => {
  const id = req.params.id;
  postModel.findById({ _id: id }, (err, post) => {
    if (err) return next(err);
    res.status(200).json(post);
  });
});

// handle a 404 page(needs to be the last)
router.get("*", (req, res) => {
  res.render("error.ejs", { siteName, siteDescription });
});

module.exports = router;
