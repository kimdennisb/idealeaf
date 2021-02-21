/* eslint-disable import/newline-after-import */
const express = require("express");
const router = express.Router();
const postmodel = require("../Models/postSchema");

// delete route
router.delete("/delete", (req, res) => {
  // res.body.header is sent through fetch request
  // titles to delete
  const titles = req.body.header;
  titles.forEach((element) => {
    postmodel.findOne({ title: element }, (err, result) => {
      if (err) res.send(500, err);
      result.remove((error, result1) => {
        if (error) throw error;
        res.send({ message: "A post was successfully deleted", result1 });
      });
    });
  });
});

module.exports = router;
