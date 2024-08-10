/* eslint-disable import/newline-after-import */
/* eslint-disable func-names */
/* eslint-disable consistent-return */

const path = require("path");
const validateFile = function (file, cb) {
  const allowedFileTypes = /jpeg|jpg|png|gif/;
  const extension = allowedFileTypes.test(path.extname(file.originalname).toLowerCase());
  const mimeType = allowedFileTypes.test(file.mimetype);
  if (extension && mimeType) {
    return cb(null, true);
  }
  cb("Invalid file type. Only JPEG, PNG and GIF file are allowed.");
};

module.exports = validateFile;
