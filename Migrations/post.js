/*This file will be modified regularly as per various upgrades to the schema
Set apps` root schema version variable to get a comparison with the document version
*/

const postModel = require("../Models/Post");

/*urlproperty is "reference" */
const addUrlProperty = function (app) {
  return function (req, res, next) {
    //set apps` post schema version
    app.set("postSchemaVersion", 1);

    postModel.find({ reference: { $exists: false } }, (error, posts) => {
      if (error) {
        next(error);
      }

      const schemaVersion = app.get("postSchemaVersion");
      posts.forEach((post) => {
        if (post.__v < schemaVersion) {
          const reference = `${post.title.split(" ").join("-")}-${post._id}`;

          postModel
            .updateOne(
              { _id: post._id },
              { $set: { reference: reference, __v: schemaVersion } },
              { upsert: false, strict: false }
            )
            .then((doc) => {
              console.log(doc);
            })
            .catch((error) => console.log(error));
        }
      });
    });
    next();
  };
};

module.exports = addUrlProperty;
