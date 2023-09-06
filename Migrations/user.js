/*This file will be modified regularly as per various upgrades to the schema
Set apps` root schema version variable to get a comparison with the document version
*/

const userModel = require("../Models/User");

const addSchemaVersionProperty = function (app) {
  return function (req, res, next) {
    userModel.findById(req.session.userId).exec((error, user) => {
      if (error) {
        next(error);
      }
      //this adds a schema property of schemaVersion: 1
      if (!user.schemaVersion) {
        userModel
          .updateOne(
            { _id: req.session.userId },
            { $set: { schemaVersion: 1 } },
            { upsert: false, strict: false }
          )
          .then((doc) => {
            console.log(doc);
          })
          .catch((error) => console.log(error));
      }
    });
    next();
  };
};

module.exports = addSchemaVersionProperty;
