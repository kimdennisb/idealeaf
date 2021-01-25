/* eslint-disable block-scoped-var */
/* eslint-disable func-names */
/* eslint-disable consistent-return */
/* eslint-disable object-shorthand */
/**
 * User registration schema
 */

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  resetPasswordToken: String,
  resetPasswordExpires: String,
});

// authenticate user input against database
UserSchema.statics.authenticate = function (email, password, callback) {
  // eslint-disable-next-line no-use-before-define
  User.findOne({ email: email })
    .exec((err, user) => {
      if (err) {
        return callback(err);
      }
      if (!user) {
        const error = new Error("User not found.");
        error.status = 401;
        return callback(error);
      }
      bcrypt.compare(password, user.password, (error, result) => {
        if (result === true) {
          return callback(null, user);
        }
        return callback();
      });
    });
};

// hashing a password before saving it to the database

UserSchema.pre("save", function (next) {
  const user = this;
  bcrypt.hash(user.password, 10, (err, hash) => {
    if (err) {
      return next(err);
    }
    user.password = hash;
    next();
  });
});

const User = mongoose.model("User", UserSchema);
module.exports = User;
