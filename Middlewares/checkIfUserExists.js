const User = require("../Models/User");
/**
   * @description find user using session stored,
   * if no user is authorized,redirect to sign in page else fetch user data
   */
const checkIfUserExists = (req, res, next) => {

  //req.session.referer = req.headers.referer || "/";
  // console.log(req.session.referer);
  User.findById(req.session.userId)
    .exec((error, authorizedUser) => {
      if (error) {
        next(error);
      }
      if (authorizedUser === null) {
        //soft redirects
        const redirect_to = req.originalUrl;
        res.redirect(`/signin?redirect_to=${redirect_to}`);
      } else {
        next();
      }
    });
};

module.exports = checkIfUserExists;
