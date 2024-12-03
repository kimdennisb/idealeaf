const User = require("../Models/User");

/**
 * @description -Apply admin role or user role
 */

const applyRole = async (req) => {
  //shallow clone credentials
  const credentials = { ...req.body };

  try {
    const count = await User.estimatedDocumentCount();
    if (count === 0) {
      Object.assign(credentials, { role: "Admin" });
    } else {
      Object.assign(credentials, { role: "User" });
    }
  } catch (error) {
    console.log(error);
  }
  return credentials
};

module.exports = applyRole;
