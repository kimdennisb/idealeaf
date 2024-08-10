const User = require("../Models/User");

/**
 * @description -Apply admin role or user role
 */

const applyRole = async (req) => {
  //shallow clone credentials
  const credentials = { ...req.body };

  await User.estimatedDocumentCount((err, count) => {
    if (!err && count === 0) {
      Object.assign(credentials, { role: "Admin" });
    } else {
      Object.assign(credentials, { role: "User" });
    }
  });
  return credentials;
};

module.exports = applyRole;
