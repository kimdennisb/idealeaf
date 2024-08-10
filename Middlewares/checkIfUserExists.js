const User = require("../Models/User");
/**
 * @description find user using session stored,
 * if no user is authorized,redirect to sign in page else fetch user data
 */
const checkIfUserExists = (req, res, next) => {

    //req.session.referer = req.headers.referer || "/";
    // console.log(req.session.referer);
    User.findById(req.session.userId)
        .exec(async(error, authorizedUser) => {
            if (error) {
                next(error);
            }
            if (authorizedUser === null) {
                //soft redirects
                const redirect_to = req.originalUrl;
                res.redirect(`/signin?redirect_to=${redirect_to}`);
            } else {
                const numberOfPostsInFrontPage = authorizedUser.numberOfPostsInFrontPage
                const userID = authorizedUser._id.toString();

                res.cookie("numberOfPostsInFrontPage", numberOfPostsInFrontPage, { maxAge: 900000 });
                res.cookie("userID", userID, { httpOnly: true });

                next();
            }
        });
};

module.exports = checkIfUserExists;