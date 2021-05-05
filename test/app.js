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
    body: "<p>Tests are important</p>",
    plainTextBody: "Tests are important",
    _imageFromSearch: "https://www.mypostimage.com/dummyImage",
    visits: 1,
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
 * Test the /GET/:title
 */

  describe("GET/:title article", () => {
    it("it should get the article with the given title", (done) => {
      const Article = new TestPostModel(dummyArticle);
      Article.save((err, article) => {
        // const title = dummyArticle.title.split("-").join(" ");
        chai.request(server)
          .get(`/singlepost/${article.title}`)
          .send(article)
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a("object");
            // console.log(article.id)
            res.body.should.have.property("title");
            res.body.should.have.property("body");
            res.body.should.have.property("plainTextBody");
            res.body.should.have.property("_imageFromSearch");
            res.body.should.have.property("title").eql(article.title);
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
          console.log(res.body);
          res.should.have.status(200);
          res.body.should.be.a("object");
          res.body.errors.should.have.property("title");
          res.body.errors.should.have.property("body");
          res.body.errors.should.have.property("plainTextBody");
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
          res.body.should.be.a("object");
          res.body.should.have.property("message").eql("Article successfully added!");
          res.body.item.should.have.property("title");
          res.body.item.should.have.property("body");
          res.body.item.should.have.property("plainTextBody");
          res.body.item.should.have.property("_imageFromSearch");
          done();
        });
    });
  });

  /**
 * Test  the /PUT/:title route
 */
  describe("/PUT/:title article", () => {
    it("it should update an article given the title in fetch request", (done) => {
      const article = new TestPostModel(dummyArticle);
      article.save((err, article) => {
        chai.request(server)
          .put("/update")
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
 * Test /DELETE/:title route
 */
/*
  describe("/DELETE/ article", () => {
    it("it should delete an article given the title in fetch request", (done) => {
      const article = new TestPostModel(dummyArticle);
      article.save((err, article) => {
        chai.request(server)
          .delete("/delete")
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a("object");
          });
      });
    });
  }); */
});
