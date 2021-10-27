/* eslint-disable prefer-destructuring */

const mongoose = require("mongoose");
// const MongoClient = require("mongodb").MongoClient;
// const fs = require("fs");
// const path = require("path");
const config = require("config");
const Role = require("../Models/Role");

require("dotenv").config();

//setUpRoles();

// database options
const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
};

const databaseUrl = function() {
    const environment = config.util.getEnv("NODE_ENV").trim();
    if (environment === "local" || environment === "test") {
        return config.localDBHost;
    } else {
        return config.devDBHost;
    }
}

const url = databaseUrl();
let connectionInstance;

const databaseConnection = () => {
    //singleton connection to mongoDB
    if (connectionInstance) {
        return connectionInstance;
    }

    mongoose.connect(url, options)
        .then(() => {
            console.log(`Successfully connected to MongoDB`);
        })
        .catch((error) => {
            console.log(`Connection to MongoDB error ${error}`);
            process.exit();
        });

    mongoose.connection.on("error", console.error.bind(console, "connection error"));

    connectionInstance = mongoose.connection;

    return mongoose.connection;
};

function setUpRoles() {
    Role.estimatedDocumentCount((error, count) => {
        if (!error && count === 0) {
            // add Admin role
            new Role({
                name: "Admin",
            }).save((err) => {
                if (err) {
                    console.log("Error", err);
                }
                console.log("Added Admin to roles collection");
            });
        } else {
            // add User role
            new Role({
                name: "User",
            }).save((err) => {
                if (err) {
                    console.log("Error", err);
                }
                console.log("Added User to roles collection");
            });
        }
    });
}

module.exports = databaseConnection;