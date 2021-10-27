/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
/* eslint-disable no-shadow */
// During the test the env variable is set to test
process.env.NODE_ENV = "test";

const mongoose = require("mongoose");
const chai = require("chai");
const config = require("config");
const chaiHttp = require("chai-http");
// eslint-disable-next-line import/no-self-import
const server = require("../index");
const TestPostModel = require("../Models/Post");

const should = chai.should();

chai.use(chaiHttp);

// parent block
describe("Articles", () => {
    // before each test we empty the database
    beforeEach((done) => {
        /* TestPostModel.remove({},(err)=>{
            done();
        }); */
        console.log("Testing started");
        done();
    });

    const dummyArticle = {
        title: "Dummy title for testing",
        html: "<p>Tests are important</p>",
        text: "Tests are important",
        feature_image: "https://www.mypostimage.com/dummyImage",
        feature_image_alt: "Dummy Image",
        date: Date.now(),
        visits: 0,
    };

    /**
     * Test the GET route
     */

    describe("/GET articles", () => {
        it("it should get all the articles", (done) => {
            chai.request(server)
                .get("/posts")
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a("array");
                    done();
                });
        });
    });

    /**
     * Test the /GET/:id
     */

    describe("/GET/:id article", () => {
        it("it should get an article by the given id", (done) => {
            let Article = new TestPostModel(dummyArticle);
            Article.save((err, article) => {
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
            });
        });
    });

    /**
     * Test the POST route
     */

    describe("/POST article", () => {
        it("it should not post an article without some fields", (done) => {
            const simulatedArticle = {};
            chai.request(server)
                .post("/article")
                .send(simulatedArticle)
                .end((err, res) => {
                    res.body.should.be.a("object");
                    res.body.errors.should.have.property("title");
                    res.body.errors.should.have.property("html");
                    res.body.errors.should.have.property("text");
                    res.body.should.have.property("errors");
                    done();
                });
        });
    });

    describe("/POST article", () => {
        it("it should post an article with all then fields", (done) => {
            chai.request(server)
                .post("/article")
                .send(dummyArticle) // dummy is sent to the post /article route
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.item.should.be.a("object");
                    res.body.item.should.have.property("title");
                    res.body.item.should.have.property("html");
                    res.body.item.should.have.property("text");
                    res.body.item.should.have.property("feature_image");
                    done();
                });
        });
    });

    /**
     * Test  the /PUT/:id route
     */
    describe("/PUT/:id article", () => {
        it("it should update an article given the id in fetch request", (done) => {
            const article = new TestPostModel(dummyArticle);
            article.save((err, article) => {
                chai.request(server)
                    .put(`/update/${article.id}`)
                    .send(dummyArticle)
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.body.should.be.a("object");
                        done();
                    });
            });
        });
    });

    /**
     * Test /DELETE/:id 
     */
    /*
        describe("/DELETE/:id article(s)", () => {
            it("it should delete an article given the id in fetch request", (done) => {
                const article = new TestPostModel(dummyArticle);
                article.save((err, article) => {
                    chai.request(server)
                        .delete(`/delete-posts/`)
                        .set("form")
                        .send({ foo: 'bar' })
                        .end((err, res) => {
                            res.should.have.status(200);
                            res.body.should.be.a("object");
                            done();
                        });
                });
            });
        });

        describe("/DELETE/:id user(s)", () => {
            it("it should delete a user given the id in fetch request", (done) => {
                const article = new TestPostModel(dummyArticle);
                article.save((err, article) => {
                    chai.request(server)
                        .delete(`/delete-users/`)
                        .end((err, res) => {
                            res.should.have.status(200);
                            res.body.should.be.a("object");
                            done();
                        });
                });
            });
        });

        describe("/DELETE/ script(s)", () => {
            it("it should delete a script given the id in fetch request", (done) => {
                const article = new TestPostModel(dummyArticle);
                article.save((err, article) => {
                    chai.request(server)
                        .delete(`/delete-scripts`)
                        .end((err, res) => {
                            res.should.have.status(200);
                            res.body.should.be.a("object");
                            done();
                        });
                });
            });
        });*/
});