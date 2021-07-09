const express = require("express");
const router = express.Router();
const { htmlToText } = require("html-to-text");
const postmodel = require("../Models/Post");

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
        //console.log(doc);
        res.json(doc);
    })
});

module.exports = router;