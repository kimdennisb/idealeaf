//During the test the env variable is set to test
process.env.NODE_ENV = 'test';

let mongoose =require('mongoose'),
    chai = require('chai'),
    chaiHttp = require('chai-http'),
    server = require('../app'),
    postSchemaModel = require('../Models/postSchema'),
    should = chai.should();

chai.use(chaiHttp);

//parent block
describe('Articles',()=>{
//before each test we empty the database
beforeEach((done)=>{
    /*postSchemaModel.remove({},(err)=>{
        done();
    });*/
    console.log(`Testing started`);
    done();
});

let dummyArticle = { 
    header: "Dummy title for testing",
    item: "Tests are important",
    _imageFromSearch: "https://www.mypostimage.com/x"
};

/**
 * Test the GET route
 */

  describe('/GET articles',()=>{
      it('it should get the first few number of articles',(done)=>{
        chai.request(server)
      .get('/')
      .end((err,res)=>{
          res.should.have.status(200);
          done();
      });  
    });
      
  });

  /**
   * Test the POST route
   */

  describe('/POST article',()=>{
      it('it should not post an article without some fields',(done)=>{
          let simulatedArticle = { };
          chai.request(server)
          .post('/article')
          .send(simulatedArticle)
          .end((err,res)=>{
              res.should.have.status(200);
              res.body.should.be.a('object');
              res.body.errors.should.have.property('header');
              res.body.errors.should.have.property('item');
              res.body.errors.should.have.property('_imageFromSearch');
              res.body.should.have.property('errors')
              done();
          });
      });
  });
  describe('/POST article',()=>{
    it('it should post an article with all then fields',(done)=>{
        
        chai.request(server)
        .post('/article')
        .send(dummyArticle) //dummy is sent to the post /article route
        .end((err,res)=>{
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property('message').eql('Article successfully added!');
            res.body.item.should.have.property('header');
            res.body.item.should.have.property('item');
            res.body.item.should.have.property('_imageFromSearch');
        
            done();
        });
    });
});
/**
 * Test the /GET/:id 
 */
describe('/:header article',()=>{
    it('it should get the article with the given properties',(done)=>{
      
        let article = new postSchemaModel(dummyArticle);
        article.save((err,article)=>{
            chai.request(server)
            .get('/' + article.header)
            .send(dummyArticle)
            .end((err,res)=>{
                res.should.have.status(200);
                res.body.should.be.a('object');
               // console.log(article.id)
                res.body.should.have.property('header');
                res.body.should.have.property('item');
                res.body.should.have.property('_imageFromSearch');
                res.body.should.have.property('header').eql(article.header);
                done();
            });
        });
    });
});

/**
 * Test /DELETE/:id route
 */

describe('/DELETE/ article',()=>{
    it('it should delete an article given the header(title) in fetch request',(done)=>{
        let article = new postSchemaModel({ header: "Example",item: "Tests are important",_imageFromSearch: "Image URL"});
        article.save((err,article)=>{
            chai.request(server)
            .delete('/delete')
            .end((err,res)=>{
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have.property('message').eql('A post was successfully deleted');
            })
        })
    })
})
});