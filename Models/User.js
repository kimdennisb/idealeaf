/* eslint-disable block-scoped-var */
/* eslint-disable func-names */
/* eslint-disable consistent-return */
/* eslint-disable object-shorthand */

/**
 * User registration schema
 */

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      lowercase: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    resetLink: {
      type: String,
      default: "",
    },
    role: {
      type: String,
      default: "User",
      enum: ["User", "Admin"],
    },
    numberOfPostsInFrontPage: {
      type: Number,
      default: 3,
    },
  },
  { timestamps: true }
);

// authenticate user input against database
UserSchema.statics.authenticate = function (email, password, callback) {
  // eslint-disable-next-line no-use-before-define
  User.findOne({ email: email }).then((user) => {
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
  }).catch((err) => {
    return callback(err);
  });
};

// hashing a password before saving it to the database
UserSchema.pre("save", function (next) {
  const user = this;
  if (!user.isModified("password")) return next();
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
