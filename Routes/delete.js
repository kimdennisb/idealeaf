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
async function deleteItems(schema, IDS) {
  const deletedItems = [];
  for (let i = 0; i < IDS.length; i++) {
    await schema.findOneAndDelete({ _id: IDS[i] }, (err, result) => {
      if (err) {
        next(err);
      }
      deletedItems.push(result);
    });
  }
  return deletedItems;
}

// delete posts
router.delete("/delete-posts", async (req, res, next) => {
  // res.body.header is sent through fetch request
  // ids to delete
  const ids = req.body.id;
  const deleteditems = await deleteItems(postModel, ids);
  res
    .status(200)
    .json({ message: "Article(s) successfully deleted", deleteditems });
});

// delete users
router.delete("/delete-users", async (req, res, next) => {
  // ids to delete
  console.log(req.body);
  const users = req.body.id;
  const deleteditems = await deleteItems(userModel, users);
  res
    .status(200)
    .json({ message: "User(s) successfully deleted", deleteditems });
});

// delete scripts
router.delete("/delete-scripts", async (req, res, next) => {
  // ids to delete
  const scripts = req.body.id;
  const deleteditems = await deleteItems(scriptToInjectModel, scripts);
  res
    .status(200)
    .json({ message: "Script(s) successfully deleted", deleteditems });
});

// delete ipDevice
router.delete("/delete-ipdevice", async (req, res, next) => {
  // ids to delete
  const scripts = req.body.id;
  const deleteditems = await deleteItems(ipDeviceModel, scripts);
  res
    .status(200)
    .json({ message: "Script(s) successfully deleted", deleteditems });
});

module.exports = router;
