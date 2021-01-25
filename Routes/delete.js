/* eslint-disable import/newline-after-import */
const express = require("express");
const router = express.Router();
const postmodel = require("../Models/postSchema");

// delete route
router.delete("/delete", (req, res) => {
  // res.body.header is sent through fetch request
  postmodel.findOne({ header: req.body.header }, (err, result) => {
    if (err) res.send(500, err);
    result.remove((error, result1) => {
      if (err) throw err;
      res.send({ message: "A post was successfully deleted", result1 });
    });
  });
});

module.exports = router;
