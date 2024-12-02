/* eslint-disable import/newline-after-import */
const express = require("express");
const router = express.Router();
const postModel = require("../Models/Post");
const scriptToInjectModel = require("../Models/ScriptToInject");
const userModel = require("../Models/User");
const ipDeviceModel = require("../Models/IpDevice");

/**
 * @returns array of deleted items
 * @param {String} schema - Model of the schema to delete from.
 * @param {Array} IDS - Array of unique ids
 */
function deleteItems(schema, IDS, next) {
  const deletedItems = [];
  for (let i = 0; i < IDS.length; i++) {
    schema.findOneAndDelete({ _id: IDS[i] }).then((result) => {
      deletedItems.push(result);
    }).catch((err) => next(err))
  }
  return deletedItems;
}

// delete posts
router.delete("/delete-posts", (req, res, next) => {
  // res.body.header is sent through fetch request
  // ids to delete
  const ids = req.body.id;
  const deleteditems = deleteItems(postModel, ids, next);
  res
    .status(200)
    .json({ message: "Article(s) successfully deleted", deleteditems });
});

// delete users
router.delete("/delete-users", (req, res, next) => {
  // ids to delete
  const users = req.body.id;
  const deleteditems = deleteItems(userModel, users, next);
  res
    .status(200)
    .json({ message: "User(s) successfully deleted", deleteditems });
});

// delete scripts
router.delete("/delete-scripts", (req, res, next) => {
  // ids to delete
  const scripts = req.body.id;
  const deleteditems = deleteItems(scriptToInjectModel, scripts, next);
  res
    .status(200)
    .json({ message: "Script(s) successfully deleted", deleteditems });
});

// delete ipDevice
router.delete("/delete-ipdevice", (req, res, next) => {
  // ids to delete
  const scripts = req.body.id;
  const deleteditems = deleteItems(ipDeviceModel, scripts);
  res
    .status(200)
    .json({ message: "Script(s) successfully deleted", deleteditems });
});

module.exports = router;
