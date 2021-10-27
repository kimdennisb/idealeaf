const config = require("config");
const siteName = config.siteName;
const siteDescription = config.description;

const Roles = ["User", "Admin"];

const checkRolesExisted = (req, res, next) => {
    if (req.session.role !== Roles[1]) {
        /*  res.status(400).send({
              message: "Failed! Page requires Admin Authentication",
          });*/
        res.render("forbidden.ejs", { siteName, siteDescription });
        return;
    }
    next();
};

module.exports = checkRolesExisted;