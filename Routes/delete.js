/* eslint-disable import/newline-after-import */
const express = require("express");
const router = express.Router();
const postmodel = require("../Models/Post");
const scriptToInjectSchema = require("../Models/scriptToInject");
const user = require("../Models/User");

// delete posts
router.delete("/delete-posts", (req, res, next) => {
  // res.body.header is sent through fetch request
  // titles to delete
  const titles = req.body.header;
  // console.log(titles);
  titles.forEach((element) => {
    postmodel.findOneAndDelete({ title: element }, (err, result) => {
      if (err) {
        next(err);
        console.log(err);
      }
      console.log(result);
    });
  });
  res.json({ message: "An article was successfully deleted" });
});

// delete users
router.delete("/delete-users", (req, res, next) => {
  // res.body.header is sent through fetch request
  // titles to delete
  const users = req.body.header;
  users.forEach((element) => {
    user.findOne({ email: element }, (err, result) => {
      if (err) {
        next(err);
        console.log(err);
      }
      console.log(result, element);
      result.remove((error, result1) => {
        if (error) throw error;
        console.log("Successfully deleted", result1);
      });
    });
  });
  res.json({ message: "The user was successfully deleted" });
});

// delete scripts
router.delete("/delete-scripts", (req, res, next) => {
  // res.body.header is sent through fetch request
  // titles to delete
  const scripts = req.body.header;
  scripts.forEach((element) => {
    scriptToInjectSchema.findOne({ url: element }, (err, result) => {
      if (err) {
        next(err);
        console.log(err);
      }
      result.remove((error, result1) => {
        if (error) throw error;
        console.log("Successfully deleted", result1);
      });
    });
  });
  res.json({ message: "The script was successfully deleted" });
});

module.exports = router;
