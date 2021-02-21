/* eslint-disable import/newline-after-import */
const express = require("express");
const router = express.Router();
const postmodel = require("../Models/postSchema");

// update the article
router.put("/update", (req, res, next) => {
  // console.log(req.body);
  const title = req.body.title.split("-").join(" ");
  // eslint-disable-next-line object-shorthand
  postmodel.findOneAndUpdate({ title: title },
    {
      $set: {
        body: req.body.body,
      },
    },
    {
      upsert: true,
    // eslint-disable-next-line no-unused-vars
    }).then((result) => {
    // console.log(result);
  }).catch((error) => {
    console.error(error);
    next(error);
  });
});

module.exports = router;
