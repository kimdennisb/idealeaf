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
const validator = require("email-validator");
const Mailgun = require("mailgun.js");
const formData = require("form-data");
const mailgunDomain = "sandboxd4f3f52e209e4038a6fe654dc393a82c.mailgun.org";
const api_key = process.env.MAILGUN_API_KEY;
const mailg = new Mailgun(formData);
const mg = mailg.client({ username: mailgunDomain, key: api_key });
const postModel = require("../Models/Post");
const userModel = require("../Models/User");
const scriptToInjectModel = require("../Models/ScriptToInject");
const applyRole = require("../Helpers/determineRole");
const storeImage = require("../Helpers/imageUpload");
const usernameRegexConvention = require("../Helpers/userNameConvention");

// sign up user
router.post("/signup", async (req, res, next) => {
  const userData = await applyRole(req);

  userModel.create(userData).then((UniqueUser) => {
    ///console.log(req.session,`session`);
    // attach user id to req.session.userId object
    req.session.userId = UniqueUser._id;
    //console.log(UniqueUser._id,`userid`);
    // redirect to referer
    return res.redirect("back");
  }).catch((error) => next(error))
});

// check signup username,email and password
router.post("/signup/check", (req, res, next) => {
  const query = req.query.q;
  const data = req.body.q;
  query === "username"
    ? //check username against rules
    userModel.find({ username: data }).then((theuser) => {

      if (!usernameRegexConvention(data)) {
        return res.status(200).json({ message: "InvalidUsername" });
      }

      if (theuser.length === 0)
        return res.status(200).json({ message: "200Username" });
      if (theuser.length != 0)
        return res.status(200).json({ message: "404Username" });
    }).catch((err) => next(err))
    : query === "email"
      ? userModel.find({ email: data }).then((theuser) => {

        if (theuser.length === 0 && validator.validate(data)) {
          return res.status(200).json({ message: "200Email" });
        } else {
          return res.status(200).json({ message: "InvalidEmail" });
        }
      }).catch((err) => next(err))
      : query === "password"
        ? //check password against rules
        console.log(`/*do nothing for password */`)
        : null;
});

// sign in user
router.post("/signin", (req, res, next) => {
  const { email, password } = req.body;
  if (email && password) {
    userModel.authenticate(email, password, (error, theUser) => {
      if (error || !theUser) {
        const err = new Error("Wrong email or password.");
        err.status = 401;
        return next(err);
      }
      req.session.userId = theUser._id;
      // console.log(req.session, "user token session", theUser._id);
      // set cookie
      //res.cookie("loggedIn", Math.random() * 123456789);

      // attach role to the session object;
      req.session.role = theUser.role;

      //redirect path
      const redirect_to = req.session.redirect_to;
      res.redirect(redirect_to);
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
  userModel.findOne({ email: email }).then(async (person) => {
    if (!person) {
      const err = new Error("No user with that email address.");
      err.status = 404;
      return next(err);
    }
    // token is sent to the forgot password form
    const token = crypto.randomBytes(32).toString("hex");

    const userEmail = person.email;
    const data = {
      from: `noreply@${siteName}.com`,
      to: [userEmail],
      subject: "Reset Password",
      html: `<table style="background-color: #f2f3f8; max-width:670px;  margin:0 auto;" width="100%" border="0" align="center" border-collapse="0" cellspacing="0">
<tbody><tr>
    <td style="height:80px;">&nbsp;</td>
</tr>

<tr>
    <td style="height:20px;">&nbsp;</td>
</tr>
<tr>
    <td>
        <table width="95%" border="0" align="center" padding="0" cellspacing="0" style="max-width:670px;background:#fff; border-radius:3px; text-align:center;-webkit-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);-moz-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);box-shadow:0 6px 18px 0 rgba(0,0,0,.06);">
            <tbody><tr>
                <td style="height:40px;">&nbsp;</td>
            </tr>
            <tr>
                <td style="padding:0 35px;">
                    <h1 style="color:#1e1e2d; font-weight:500; margin:0;font-size:32px;font-family:'Rubik',sans-serif;">You have
                        requested to reset your password</h1>
                    <span style="display:inline-block; vertical-align:middle; margin:29px 0 26px; border-bottom:1px solid #cecece; width:100px;"></span>
                    <p style="color:#455056; font-size:15px;line-height:24px; margin:0;">
                        A unique link to reset your password has been generated for you. 
                        To reset your password, click the following link and follow the instructions.
                    </p>
                    <a href="https://${req.headers.host}/reset/${token}" style="background:#20e277;text-decoration:none !important; font-weight:500; margin-top:35px; color:#fff;text-transform:uppercase; font-size:14px;padding:10px 24px;display:inline-block;border-radius:50px;">Reset
                        Password</a>
                </td>
            </tr>
            <tr>
                <td style="height:40px;">&nbsp;</td>
            </tr>
        </tbody></table>
    </td>
</tr><tr>
    <td style="height:20px;">&nbsp;</td>
</tr>
<tr>
    <td style="height:80px;">&nbsp;</td>
</tr>
</tbody></table>`,
    };

    const filter = { email: email };
    const update = {
      $set: {
        resetLink: token,
      },
    };

    userModel.findOneAndUpdate(
      filter,
      update,
      { new: true, upsert: true },
      (err, success) => {
        if (err) next(err);
        mg.messages
          .create(mailgunDomain, data)
          .then((msg) => res.json(msg))
          .catch((err) => console.error(err));
      }
    );
  });
});

// reset password
router.post("/reset/:token", (req, res, next) => {
  const query = {
    resetLink: req.params.token,
  };

  // find user with this token
  // eslint-disable-next-line no-unused-vars
  userModel.findOne(query).then((theuser) => {
    if (!theuser) {
      res.json({ message: "Password reset token is invalid or has expired." });
    }

    // if found,update the collection
    const myquery = { resetLink: req.params.token };

    userModel.findOne(myquery, (error, result) => {
      if (err) return next(error);
      const obj = {
        password: req.body.password,
        resetLink: "",
      };

      // update user
      _.assign(result, obj);

      // eslint-disable-next-line no-shadow
      result.save((err) => {
        if (err) return next(err);
        res.json({ message: `Password reset successfully` });
      });
    });
  }).catch((err) => next(err));
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
  /*limits: {
        fields: 12,
        fileSize: 1024 * 1024 * 10,
        files: 12,
        parts: 24,
    },*/
});

// article image
router.post(
  "/articleimage",
  uploadImage.single("photo"),
  async (req, res, next) => {
    const photo = req.file;

    let imageattributes = {};

    const widthsize = 184;
    const heightsize = 111;

    let resizedimagehref = "";

    await sharp(photo.buffer)
      .resize({ width: widthsize, height: heightsize })
      .jpeg({ quality: 90 })
      .toBuffer()
      .then((buffer) => {
        const photoName = `${photo.originalname}-${widthsize}`;
        const returnedURL = storeImage({ photoName, buffer });
        resizedimagehref = `/image/${returnedURL}`;
      })
      .catch((err) => {
        next(err);
      });

    Object.assign(imageattributes, { src: resizedimagehref })

    res.json(imageattributes);
  }
);

/**This endpoint is not used currently.
 * Storing each resized image deamed to take more storage than storing a single image and resizing on the fly **/
router.post(
  "/admin/photos",
  uploadImage.array("photo", 5),
  async (req, res, next) => {
    const accessIDS = await Promise.all(
      req.files.map(async (photo) => {
        if (!photo.originalname) {
          return res
            .status(400)
            .json({ message: "No photo name in request file" });
        }
        // sizes to use to resize images
        const sizes = [239, 319, 468, 512, 612, 687];
        const imageattributes = {};

        // alt
        Object.assign(imageattributes, { alt: photo.originalname })

        //resize a single image in all the sizes
        //return a promise in which Promise.all() returns a single promise
        //the single promise fulfills if all the input's promises fulfill
        //it rejects when any of the input's promises rejects
        const resizedimagehrefs = await Promise.all(
          sizes.map(async (size) => {
            //let resizedimagehref = "";

            //image width to height ratio is 16:9
            return await sharp(photo.buffer)
              .resize({
                width: size,
                height: Math.floor(size * 0.5625),
              })
              .jpeg({ quality: 80 })
              .toBuffer()
              .then((buffer) => {
                const photoName = `${photo.originalname}-${size}`;
                const returnedURL = storeImage({ photoName, buffer });
                return `/image/${returnedURL} ${size}w`;
              })
              .catch((err) => {
                next(err);
              });
          })
        );
        //build responsive images
        //const sizescondition = `(min-width:851px) 612px,(min-width:781px) and (max-width:850px) 561px,(min-width:601px) and (max-width:780px) 687px,(min-width:432px) and (max-width:600px) 468px,(min-width:341px) and (max-width:431px) 319px,238px`;
        const sizescondition = `(min-width: 1460px) 612px, (min-width: 860px) calc(38.97vw + 51px), (min-width: 800px) 65vw, (min-width: 620px) 87.5vw, calc(88vw - 60px)`;
        const srcset = resizedimagehrefs.toString();
        const src = resizedimagehrefs[1];
        const _ = { sizes: sizescondition, srcset: srcset, src: src };
        return { ...imageattributes, ..._ };
      })
    );

    res.send(accessIDS);
  }
);

router.post(
  "/admin/images",
  uploadImage.array("photo", 8),
  async (req, res, next) => {
    const accessIDS = await Promise.all(
      req.files.map(async (photo) => {
        if (!photo.originalname) {
          return res
            .status(400)
            .json({ message: "No photo name in request file" });
        }

        const imageattributes = {};

        // alt
        Object.assign(imageattributes, { alt: photo.originalname })

        const { originalname, buffer } = photo;

        const returnedURL = storeImage({ originalname, buffer });

        return { ...imageattributes, src: returnedURL };
      })
    );
    res.send(accessIDS);
  }
);

// eslint-disable-next-line max-len
// const _searchImageRegex = /<img\b(?=\s)(?=(?:[^>=]|='[^']*'|="[^"]*"|=[^'"][^\s>]*)*?\ssrc=['"]([^"]*)['"]?)(?:[^>=]|='[^']*'|="[^"]*"|=[^'"\s]*)*"\s?\/?>/;

router.post("/article", (req, res, next) => {
  const { title, html, feature_image, feature_image_alt } = req.body;
  const text = htmlToText(html);
  const article = {
    title: title,
    html: html,
    text: text,
    feature_image: feature_image,
    feature_image_alt: feature_image_alt,
    visits: 0,
  };

  //get id of model instance to generate a better title(returns id)
  const post = new postModel();

  //String().split() will break if value is undefined.I handled this with a try catch block
  const postProperties = {
    ...article,
    reference: (function () {
      try {
        return `${title.split(" ").join("-")}-${post._id}`
      } catch (error) {
        next(error);
      }
    })()
  };

  Object.assign(post, postProperties);

  post.save().then((item) => {
    // if no errors,send it back to client
    res.status(200).json({ item: item });
  }).catch((error) => {
    next(error);
    res.json(error);
  });
});

router.post("/injectcode", (req, res, next) => {
  req.body.forEach((script) => {
    const scriptToInject = new scriptToInjectModel({
      script: script.script,
      placement: script.placement,
    });

    if (script.script.length > 1) {
      scriptToInject.save((item) => {

      }).catch((err) => next(err))
    } else {
      return null;
    }
  });
  res.json({ message: " Script successfully added!" });
});

// export the router
module.exports = router;
