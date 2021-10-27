/* eslint-disable eqeqeq */
/* eslint-disable object-shorthand */
/* eslint-disable consistent-return */
/* eslint-disable no-lonely-if */
/* eslint-disable prefer-destructuring */
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
const postmodel = require("../Models/Post");
const databaseConnection = require("../Database/database");
const ObjectID = mongodb.ObjectID;
const scriptToInjectModel = require("../Models/scriptToInject");
const user = require("../Models/User");
const cookieReader = require("../Middlewares/cookieReader");
const softRedirects = require("../Middlewares/softRedirects")
const formatDate = require("../Helpers/formatDate");

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

})

// access user admin
// GET route after registering
router.get("/admin/posts", (req, res, next) => {
    postmodel.find({}, (err, data) => {
        if (err) {
            next(err);
        }
        res.render("posts.ejs", { data: data, siteName, siteDescription });
    });
});

// access list of users
router.get("/admin/users", (req, res, next) => {
    user.find({}, (err, data) => {
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


router.get("/data", (req, res, next) => {
    let query = req.query.q;

    (query === "posts") ? (
        postmodel.find({}, (err, data) => {
            if (err) {
                next(err);
            }
            res.json(data);
        })
    ) : (query === "users") ? (
        user.find({}, (err, data) => {
            if (err) {
                next(err);
            }
            res.json(data);
        })
    ) : (query === "scripts") ? (
        scriptToInjectModel.find({}, (err, data) => {
            if (err) {
                next(err);
            }
            res.json(data);
        })
    ) : null;
})

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

// new article
router.get("/admin/new", (req, res, next) => {
    user.findById(req.session.userId)
        .exec((error, authorizedUser) => {
            if (error) {
                next(error);
            }
            if (authorizedUser === null) {
                (res.redirect("/signin"));
            } else {
                res.render("writeArticle.ejs", { siteName, siteDescription });
            }
        });
});

// get injected scripts
router.get("/getinjectedscripts", (req, res) => {
    scriptToInjectModel.find({}, (err, scripts) => {
        if (err) res.send(500, err);
        res.send(scripts);
    });
});

// edit article
router.get("/admin/edit/:id", (req, res, next) => {
    const id = req.params.id;
    postmodel.findOne({ _id: id }, (err, data) => {
        if (err) { next(err) }
        const { title, html } = data;
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

        const serializedDoc = document.querySelector("body").innerHTML;
        const fineData = {
            title: title,
            html: serializedDoc
        }
        res.render("editArticle.ejs", { data: fineData, siteName, siteDescription });
    });
});

// posts get route
router.get("/page/:page", cacheMiddleware(30), (req, res, next) => {
    // console.log(req.session)
    const perPage = 4;
    const page = req.params.page || 1;

    postmodel.find({})
        // eslint-disable-next-line quote-props
        .sort({ "createdAt": -1 })
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


// view specific article
router.get("/article/:IDOfTheArticle", cacheMiddleware(30), (req, res, next) => {
    const IDOfTheArticle = req.params.IDOfTheArticle;

    // handle views count by incrementing visitors count
    const filter = { _id: IDOfTheArticle };
    const update = {
        $inc: {
            visits: 1,
        }
    }

    postmodel.findByIdAndUpdate(filter, update, (err, article) => {
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
            updatedAt
        } = article;

        const hostName = req.headers.host;
        // eslint-disable-next-line camelcase
        const featureimage = feature_image;
        const siteURL = `${hostName}/article/${IDOfTheArticle}`;
        const description = htmlToText(html, { wordWrap: 130, baseElement: "p" });
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
        };
        // eslint-disable-next-line camelcase
        (feature_image === "") ?
        res.render("viewArticleWithoutOGImage", { data: cleanArticle, siteName }): res.render("viewArticle", { data: cleanArticle, siteName });
    });
});

// get first number of posts on the front page(4)
router.get("/", cacheMiddleware(30), (req, res, next) => {
    if (!req.query.s) {
        postmodel.find({})
            // eslint-disable-next-line object-curly-spacing
            // eslint-disable-next-line quote-props
            .sort({ "createdAt": -1 })
            .limit(4)
            .exec((err_, data) => {
                if (err_) res.send(500, err_);
                // eslint-disable-next-line no-unused-vars
                postmodel.count().exec((err, count) => {
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
    postmodel.fullTextSearch(req.query.s).exec((err, results) => {
        if (err) next(err);
        res.json(results);
    });
});

router.get("/image/:imageID", (req, res, next) => {
    const imageID = req.params.imageID;
    const width = Number(req.query.w);

    try {
        let photoID = new ObjectID(imageID);
    } catch (err) {
        const error = new Error("Invalid ImageID in URL parameter. Must be a single String of 12 bytes or a string of 24 hex characters");
        error.status = 400;
        // pass the error to the error handler
        return next(error);
    }

    const bucket = new mongoose.mongo.GridFSBucket(conn.db, {
        bucketName: "photos",
    });

    const photoID = new ObjectID(imageID);
    const downloadStream = bucket.openDownloadStream(photoID);

    let buffer = [];
    downloadStream.on("data", (chunk) => {
        buffer.push(chunk);
    });

    downloadStream.on("error", () => {
        res.sendStatus(404);
    });

    downloadStream.on("end", async() => {
        const completeBuffer = Buffer.concat(buffer);
        await sharp(completeBuffer)
            .resize({
                width: width,
                height: Math.floor(width * 0.5625)
            })
            .jpeg({ quality: 80 })
            .toBuffer()
            .then((buffer) => {
                res.write(buffer);
            });
        res.end();
    });

})

/**
 * GET /image/:photoID
 */
router.get("/image-asset/:photoID", cacheMiddleware(30), (req, res, next) => {
    // get images from req.params.photoID object

    try {
        let photoID = new ObjectID(req.params.photoID);

    } catch (err) {
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

/* route for fetch */
// gets all posts
router.get("/posts", cacheMiddleware(30), (req, res, next) => {
    postmodel.find({}).exec((err, posts) => {
        if (err) return next(err);
        res.status(200).json(posts);
    });
});

// verify reset password token
router.get("/reset/:token", (req, res, next) => {
    console.log(req.params.token);
    const query = { resetLink: req.params.token };

    user.findOne(query, (err, theuser) => {

        if (!theuser) {
            const error = new Error("Password reset token is invalid or has expired.");
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
    postmodel.findById({ _id: id }, (err, post) => {
        if (err) return next(err);
        res.status(200).json(post);
    });
});

// handle a 404 page(needs to be the last)
router.get("*", (req, res) => {
    res.render("error.ejs", { siteName, siteDescription });
});

module.exports = router;