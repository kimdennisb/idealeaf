const express = require("express");
const router = express.Router();
const { htmlToText } = require("html-to-text");
const postmodel = require("../Models/Post");
const user = require("../Models/User");
const cookieReader = require("../Middlewares/cookieReader.js");

// update the article
router.put("/update/:id", (req, res, next) => {

    const id = req.params.id;
    const text = htmlToText(req.body.html);
    const filter = { _id: id };
    const update = {
        $set: {
            title: req.body.title,
            html: req.body.html,
            text: text,
            feature_image: req.body.feature_image,
            feature_image_alt: req.body.feature_image_alt,
        }
    }

    postmodel.findOneAndUpdate(filter, update, { new: true, upsert: true }, (err, doc) => {
        if (err) {
            next(err);
        }
        res.status(200).json(doc);
    })
});

//update number of posts per page in the front page
router.put("/postsperpage/update", cookieReader, (req, res, next) => {
    const { postsperpage } = req.body;
    const { numberOfPostsInFrontPage, userID } = res.locals.cookies;

    const filter = { _id: userID };
    const update = {
        $set: {
            numberOfPostsInFrontPage: postsperpage,
        }
    }

    user.findOneAndUpdate(filter, update, { new: true, upsert: true }, (err, doc) => {
        if (err) {
            next(err);
        }
        res.clearCookie("numberOfPostsInFrontPage");
        res.cookie("numberOfPostsInFrontPage", numberOfPostsInFrontPage, { maxAge: 900000 });
        res.status(200).json(doc);

    })
});

module.exports = router;