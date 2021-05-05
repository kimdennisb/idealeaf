/* eslint-disable prefer-destructuring */
/* eslint-disable import/newline-after-import */
/* eslint-disable object-shorthand */
/* eslint-disable no-underscore-dangle */
/* eslint-disable operator-linebreak */
/* eslint-disable consistent-return */
const express = require("express");
const router = express.Router();
const multer = require("multer");
const mongoose = require("mongoose");
mongoose.Promise = global.Promise;
const sharp = require("sharp");
const config = require("config");
const siteName = config.siteName;
const siteDescription = config.description;
const _ = require("lodash");
const crypto = require("crypto");
const { htmlToText } = require("html-to-text");
const mailgun = require("mailgun-js");
const mailgunDomain = "sandboxd4f3f52e209e4038a6fe654dc393a82c.mailgun.org";
const mg = mailgun({ apiKey: process.env.MAILGUN_API_KEY, domain: mailgunDomain });
const postmodel = require("../Models/Post");
const user = require("../Models/User");
const Injectcode = require("../Models/scriptToInject");
const applyRole = require("../Helpers/determineRole");
const storeImage = require("../Helpers/imageUpload");

// sign up user
router.post("/signup", async (req, res, next) => {
  // check if user with the email address exists,if exists notify else proceed to sign up
  user.findOne({ email: req.body.email }, (err, identity) => {
    if (identity != null) {
      const error = new Error("User with that email address already exists!");
      next(error);
    // console.log(identity);
    }
  });

  // confirm that user typed same password twice
  if (req.body.password !== req.body.passwordConf) {
    const err = new Error("Passwords do not match.");
    err.status = 400;
    res.send("passwords don`t match");
    return next(err);
  }

  const userData = await applyRole(req);

  user.create(userData, (error, UniqueUser) => {
    if (error) {
      return next(error);
    }
    console.log(req.session);
    // attach user id to req.session.userId object
    req.session.userId = UniqueUser._id;
    // console.log(UniqueUser._id);
    // redirect to referer
    return res.redirect("back");
  });
});

// sign in user
router.post("/signin", (req, res, next) => {
  if (req.body.email && req.body.password) {
    user.authenticate(req.body.email, req.body.password, (error, theUser) => {
      if (error || !theUser) {
        const err = new Error("Wrong email or password.");
        err.status = 401;
        return next(err);
      }
      req.session.userId = theUser._id;
      // console.log(req.session, "user token session", theUser._id);
      // set cookie
      res.cookie("loggedIn", Math.random() * 123456789);
      // console.log(req.session.referer);
      // attach role to the session object;
      req.session.role = theUser.role;
      res.redirect(req.session.referer);
    });
  } else {
    const err = new Error("All fields required.");
    err.status = 400;
    return next(err);
  }
});

// reset password
router.post("/forgot-password", (req, res, next) => {
  const { email } = req.body;

  // find user with this email address
  user.findOne({ email: email })
    .then(async (person) => {
      if (!person) {
        const err = new Error("No user with that email address.");
        err.status = 404;
        return next(err);
      }
      // token is sent to the forgot password form
      const token = crypto.randomBytes(32).toString("hex");

      const userEmail = person.email;
      const data = {
        from: "noreply@blog.com",
        to: userEmail,
        subject: "Reset Password",
        html: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n
        Please click on the following link, or paste this into your browser to complete the process:\n\n
        https://${req.headers.host}/reset/${token}  \n\n  
        If you did not request this, please ignore this email and your password will remain unchanged.\n`,
      };
      /*
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: "kimutaidennisbrian@gmail.com",
          pass: "kimutaidn1#",
        },
      });
       */
      /*
      const mailOptions = {
        from: "kimdennisb@gmail.com",
        to: userEmail,
        subject: `Reset your ${siteName} password`,
        text: "message to be conveyed"
      };
      */
      // send the email
      /*
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log(error);
        } else {
          console.log(`Email sent: ${info.response}`);
        }
      });
      */
      // eslint-disable-next-line no-unused-vars
      return user.updateOne({ resetLink: token }, (err, success) => {
        if (err) next(err);
        mg.messages().send(data, (error, body) => {
          // if (error) next(error);
          console.log(`Email has been sent!${body}`);
          //  return res.json(body);
          res.render("emailSentForPasswordChange.ejs", { siteName, siteDescription });
        });
      });
    });
});

// reset password
router.post("/reset/:token", (req, res, next) => {
  const query = {
    resetLink: req.params.token,
  };
  // find user with this token
  // eslint-disable-next-line no-unused-vars
  user.findOne(query, (err, theuser) => {
    if (!theuser) {
      res.json({ message: "Password reset token is invalid or has expired." });
    }
    // if found,update the collection
    const myquery = { resetLink: req.params.token };
    user.findOne(myquery, (error, result) => {
      if (err) return next(error);
      // console.log(result);
      console.log(req.body.password);
      const obj = {
        password: req.body.password,
        resetLink: "",
      };
      // update user
      _.assign(result, obj);
      // eslint-disable-next-line no-shadow
      result.save((err) => {
        if (err) return next(err);
        // console.log(result, "xo");
        // return res.status(200).json(result);
        res.render("passwordChangedSuccessfully.ejs", { siteName, siteDescription });
      });
    });
  });
});

/**
 * Resize and Store Images in Mongo GridFS
 * Multer adds a body object and a file or files object to the req object
 * Body object contains the values of text fields of the form,
 * the file or files object contains then files uploaded via the form
 * memory storage,the file info will contain a file called buffer.
 * Multer will not process any form which is not multipart(multipart/form-data)
 */

const storage = multer.memoryStorage();
const uploadImage = multer({
  storage: storage,
  limits: {
    fields: 12,
    fileSize: 1024 * 1024 * 10,
    files: 12,
    parts: 24,
  },
});

// article image
router.post("/articleimage", uploadImage.single("articleimage"), async (req, res, next) => {
  // console.log(req.file);
  const photo = req.file;
  let imagesrcset;
  const size = 95;
  await sharp(photo.buffer)
    .resize({ width: size, height: size })
    .jpeg({ quality: 80 })
    .toBuffer()
    .then((buffer) => {
    // console.log(buffer);
      const photoName = `${photo.originalname}-${size}`;
      const returnedURL = storeImage({ photoName, buffer });
      imagesrcset = `/image/${returnedURL}`;
    })
    .catch((err) => {
      console.log(err);
      next(err);
    });
  res.json(imagesrcset);
});

router.post("/photos", uploadImage.array("photo", 5), async (req, res, next) => {
  // console.log(req.files);

  // iterate through the files array to perform file operations and return access IDS.
  const accessIDS = await Promise.all(req.files.map(async (photo) => {
    if (!photo.originalname) {
      // return res.status(400).json({ message: "No photo name in request file" })
      // assign an empty string to the photoName
      // eslint-disable-next-line no-param-reassign
      photo.originalname = "";
    }
    //  let urlArray = [];
    // sizes to use to resize images
    const sizes = [240, 320, 480];
    const imagesrcsets = [];
    // enable alt images
    imagesrcsets.push(photo.originalname);
    await Promise.all(
      sizes.map(async (size) => {
        // let me not delete this:)
      /*  const image = await jimp.read(photo.buffer);
        image.resize(size, jimp.AUTO);
        image.quality(90);
        image.getBuffer(jimp.AUTO, (err, buffer) => {
          if (err) console.error(err);
          console.log(buffer);
          const photoName = `${photo.originalname}-${size}`;
          const returnedURL = storeImage({ photoName, buffer });
          // eslint-disable-next-line prefer-template
          imagesrcsets.push("/image/" + returnedURL + " " + size + "w");
        }); */

        // using sharp(its faster)
        await sharp(photo.buffer)
          .resize({ width: size })
          .jpeg({ quality: 80 })
          .toBuffer()
          .then((buffer) => {
            // console.log(buffer);
            const photoName = `${photo.originalname}-${size}`;
            const returnedURL = storeImage({ photoName, buffer });
            // eslint-disable-next-line prefer-template
            imagesrcsets.push("/image/" + returnedURL + " " + size + "w");
          })
          .catch((err) => {
            console.log(err);
            next(err);
          });
      }),
    );

    // build the srcset nicely
    //  console.log(imagesrcsets);
    const id = imagesrcsets.join();
    return id;
  }));
    // res.status(201).json({accessIDS});
  console.log(accessIDS);
  // accessIDS will be used to send  an http get request for them to be rendered.
  res.send(accessIDS);
});

// eslint-disable-next-line max-len
// const _searchImageRegex = /<img\b(?=\s)(?=(?:[^>=]|='[^']*'|="[^"]*"|=[^'"][^\s>]*)*?\ssrc=['"]([^"]*)['"]?)(?:[^>=]|='[^']*'|="[^"]*"|=[^'"\s]*)*"\s?\/?>/;

router.post("/article", (req, res) => {
  console.log(req.body);
  const text = htmlToText(req.body.html);
  const article = {
    title: req.body.title,
    html: req.body.html,
    text: text,
    feature_image: req.body.feature_image,
    visits: 0,
  };
  // eslint-disable-next-line new-cap
  const post = new postmodel(article);
  post.save((err, item) => {
    if (err) {
      res.send(err);
      console.log(err);
    } else { // if no errors,send it back to client
      res.json({ message: "Article successfully added!", item });
      console.log(item);
    }
  });
});

router.post("/injectcode", (req, res, next) => {
  console.log(req.body);
  req.body.forEach((script) => {
    const scriptToInject = new Injectcode({
      script: script.script,
      placement: script.placement,
    });

    if (script.script.length > 1) {
      scriptToInject.save((err, item) => {
        if (err) {
          next(err);
        } else {
          console.log("saved successfully", item);
        }
      });
    } else {
      return null;
    }
  });
  res.json({ message: " Script successfully added!" });
});

// export the router
module.exports = router;
