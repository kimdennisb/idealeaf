const Roles = ["User", "Admin"];

const checkRolesExisted = (req, res, next) => {
  if (req.session.role !== Roles[1]) {
    res.status(400).send({
      message: "Failed! Page requires Admin Authentication",
    });
    return;
  }
  next();
};

module.exports = checkRolesExisted;
