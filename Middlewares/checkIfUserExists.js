const User = require("../Models/User");
/**
   * @description find user using session stored
   * if no user is authorized,redirect to sign in page else fetch user data
   */
const checkIfUserExists = (req, res, next) => {
  // console.log(req.headers.referer);
  req.session.referer = req.headers.referer || "/";
  // console.log(req.session.referer);
  User.findById(req.session.userId)
    .exec((error, authorizedUser) => {
      if (error) {
        next(error);
      }
      if (authorizedUser === null) {
        (res.redirect("/signin"));
      } else {
        next();
      }
    });
};

module.exports = checkIfUserExists;
