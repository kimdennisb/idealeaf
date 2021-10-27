/* eslint-disable func-names */
/* eslint-disable object-shorthand */
/**
 * Store Image in the file system
 */

const multer = require("multer");
const validateFile = require("./validateFile");

const storageEngine = multer.diskStorage({
  destination: "./public/files",
  filename: function (req, file, fn) {
    fn(`null, ${new Date().getTime().toString()}-${file.originalname}`);
  },
});

const upload = multer({
  storage: storageEngine,
  fileFilter: function (req, file, callback) {
    validateFile(file, callback);
  },
}).array("photos", 5);

module.exports = upload;
