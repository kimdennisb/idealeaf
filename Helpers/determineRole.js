const User = require("../Models/User");

/**
 * @description -Apply admin role or user role
 */

const applyRole = async (req) => {
  const userData = {};
  await User.estimatedDocumentCount((err, count) => {
    if (!err && count === 0) {
      userData.email = req.body.email;
      userData.password = req.body.password;
      userData.role = "Admin";
    } else {
      userData.email = req.body.email;
      userData.password = req.body.password;
      userData.role = "User";
    }
  });
  return userData;
};

module.exports = applyRole;
