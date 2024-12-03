const mongoose = require("mongoose");
const { Readable } = require("stream");
const {databaseConnection} = require("../Database/database");

// call database function
const conn = databaseConnection();

// store image helper function
const storeImage = (photo) => {
    const photoName = photo.photoName;
    // initialize gridfs bucket
    const bucket = new mongoose.mongo.GridFSBucket(conn.db, {
        bucketName: "photos",
    });
    // Covert buffer to Readable Stream
    const readablePhototream = new Readable();
    readablePhototream.push(photo.buffer);
    readablePhototream.push(null);
    const uploadStream = bucket.openUploadStream(photoName);
    const id = uploadStream.id;
    readablePhototream.pipe(uploadStream);

    uploadStream.on("error", (req, res, next) => res.status(500).json({ message: "Error uploading file" }));

    uploadStream.on("finish", () => {
        console.log(`"File uploaded successfully, stored under Mongo ObjectID: " ${id}`);
    });
    return id;
};

module.exports = storeImage;