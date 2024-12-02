/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
/* eslint-disable no-shadow */
// During the test the env variable is set to test
process.env.NODE_ENV = "test";

const mongoose = require("mongoose");
const chai = require("chai");
const config = require("config");
const chaiHttp = require("chai-http");

const server = require("../index");
const TestPostModel = require("../Models/Post");
const TestUserModel = require("../Models/User");
const TestScriptModel = require("../Models/ScriptToInject");
const { test } = require("mocha");

const should = chai.should();

chai.use(chaiHttp);

// parent block
describe("Articles", () => {


    const dummyArticle = {
        title: "Dummy title for testing",
        html: "<p>Tests are important</p>",
        text: "Tests are important",
        feature_image: "https://www.mypostimage.com/dummyImage",
        feature_image_alt: "Dummy Image",
        date: Date.now(),
        visits: 0,
    };

    // before each test we empty the database
    beforeEach((done) => {
        //Don`t delete database because we use a single post from the TestPostModel() instance.We will use this in PUt
        /*TestPostModel.deleteMany({ title: postProperties.title }, (err) => {
            done();
        });*/

        let testArticle = new TestPostModel();

        const postProperties = {
            ...dummyArticle,
            reference: `${dummyArticle.title.split(" ").join("-")}-${testArticle._id}`,
        };

        Object.assign(testArticle, postProperties);
        TestPostModel.deleteMany({}).then((deletedItems) => {

        }).catch((err) => {
            console.log(err);
        })
        console.log("Testing Articles started");
        done()
    });

    /**
     * Test the GET route
     */

    describe("/GET articles", () => {
        it("it should get all the articles in a certain page", (done) => {
            const examplePage = 1;
            chai.request(server)
                .get(`/posts/${examplePage}`)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.posts.should.be.a("array");
                    done();
                });
        });
    });

    /**
     * Test the /GET/:id
     */

    describe("/GET/:id article", () => {
        it("it should get an article by the given id", (done) => {

            let testArticle = new TestPostModel();

            const postProperties = {
                ...dummyArticle,
                reference: `${dummyArticle.title.split(" ").join("-")}-${testArticle._id}`,
            };

            Object.assign(testArticle, postProperties);

            testArticle.save().then((article) => {
                chai.request(server)
                    .get(`/post/${article.id}`)
                    .send(article)
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.body.should.be.a("object");
                        res.body.should.have.property("title");
                        res.body.should.have.property("html");
                        res.body.should.have.property("text");
                        res.body.should.have.property("feature_image");
                        res.body.should.have.property("_id").eql(article.id);
                        done();
                    });
            }).catch((error) => {
                console.log(error);
            });
        });
    });

    /**
     * Test the POST route
     */

    describe("/POST article", () => {
        it("it should not post an article without some fields", (done) => {
            let simulatedArticle = { html: "<p>This is a sample text</p>" };
            chai.request(server)
                .post("/article")
                .send(simulatedArticle)
                .end((err, res) => {
                    res.body.should.be.a("object");
                    res.body.should.have.property('errors');
                    res.body.errors.should.have.property("title");
                    res.body.errors.should.have.property("reference");
                    done();
                });
        });
    });

    describe("/POST article", () => {
        it("it should post an article with all then fields", (done) => {

            let testArticle = new TestPostModel();

            const postProperties = {
                ...dummyArticle,
                reference: `${dummyArticle.title.split(" ").join("-")}-${testArticle._id}`,
            };

            Object.assign(testArticle, postProperties);

            chai.request(server)
                .post("/article")
                .send(postProperties) // dummy is sent to the post /article route
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.item.should.be.a("object");
                    res.body.item.should.have.property("title");
                    res.body.item.should.have.property("html");
                    res.body.item.should.have.property("text");
                    res.body.item.should.have.property("visits");
                    res.body.item.should.have.property("reference");
                    done();
                });
        });
    });

    /**
     * Test  the /PUT/:id route
     */
    describe("/PUT/:id article", () => {
        it("it should update an article given the id", (done) => {

            let testArticle = new TestPostModel();

            const postProperties = {
                ...dummyArticle,
                reference: `${dummyArticle.title.split(" ").join("-")}-${testArticle._id}`,
            };

            Object.assign(testArticle, postProperties);

            testArticle.save().then((article) => {
                chai.request(server)
                    .put(`/update/${article.id}`)
                    .send({ ...postProperties, title: "This is an updated title" })
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.body.should.be.a("object");
                        res.body.should.have.property("title").eql("This is an updated title");
                        done();
                    });
            }).catch((error) => {
                console.log(error);
            });
        });
    });

    /**
     * Test /DELETE/:id 
     */

    describe("/DELETE/:id article(s)", () => {
        it("it should delete an article given the id", (done) => {

            let testArticle = new TestPostModel();

            const postProperties = {
                ...dummyArticle,
                reference: `${dummyArticle.title.split(" ").join("-")}-${testArticle._id}`,
            };

            Object.assign(testArticle, postProperties);

            testArticle.save().then((article) => {
                chai.request(server)
                    .delete(`/delete-posts`)
                    .send({ id: article.id })
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.body.should.be.a("object");
                        res.body.should.have.property("message").eql("Article(s) successfully deleted");
                        done();
                    });
            }).catch((error) => {
                console.log(error);
            });
        });
    });
});

describe("Users", () => {

    const dummyUser = {
        username: "John Doe",
        email: "johndoe@noreply.com",
        password: "password"
    }

    const testUser = new TestUserModel();

    Object.assign(testUser, dummyUser);

    beforeEach((done) => {
        TestUserModel.deleteMany({ username: dummyUser.username }).then((deletedItem) => {
            console.log("Testing Users started");
            done();
        }).catch((error) => {
            console.log(error);
        });

    });

    describe("/DELETE/:id user(s)", () => {
        it("it should delete a user given the id", (done) => {
            testUser.save().then((user) => {
                chai.request(server)
                    .delete(`/delete-users`)
                    .send({ id: user.id })
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.body.should.be.a("object");
                        res.body.should.have.property("message").eql("User(s) successfully deleted");
                        done();
                    });
            }).catch((error) => {
                console.log(error);
            });
        });
    });

})

describe("Scripts", () => {

    const dummyScript = {
        script: "<script src='index.js'></script>",
        placement: "footer"
    }

    const testScript = new TestScriptModel();

    Object.assign(testScript, dummyScript);

    beforeEach((done) => {
        TestScriptModel.deleteMany({ script: dummyScript.script }).then((deletedItem) => {
            console.log("Testing Scripts started");
            done();
        }).catch((error) => {
            console.log(error)
        });
    });

    describe("/DELETE/:id user(s)", () => {
        it("it should delete a script given the id", (done) => {
            testScript.save().then((script) => {
                chai.request(server)
                    .delete(`/delete-scripts`)
                    .send({ id: script.id })
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.body.should.be.a("object");
                        res.body.should.have.property("message").eql("Script(s) successfully deleted");
                        done();
                    });
            }).catch((error) => {
                console.log(error)
            });
        });
    });

})