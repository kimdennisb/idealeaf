var express = require('express');
const { use } = require('./post');

   const router = express.Router(),
    cacheMiddleware = require('../Cache/cache'),
    postmodel = require('../Models/postSchema'),
    databaseConnection = require('../Database/database'),
    ObjectID = require('mongodb').ObjectID,
    fs = require('fs'),
    mongoose = require('mongoose'),
    scriptToInjectModel = require('../Models/scriptToInjectSchema'),
    user = require('../Models/userSchema');

    //call database function
   let conn = databaseConnection();
  

    //getting the landing page
router.get('/signup',(req, res)=>{
    res.render('signUp.ejs'); 
});

//signIn page
router.get('/signin',(req, res)=>{
    res.render('signIn.ejs')
});

 //access user admin
 // GET route after registering
 router.get('/admin',(req, res, next)=> {
  
  user.findById(req.session.userId)
    .exec(function (error, user) {
      if (error) {
        return next(error);
      } else {
        if (user === null) {
          /*var err = new Error('Not authorized! Go back!');
          err.status = 400;
           return next(err);*/
         return res.redirect('/signin')
        } else {
          postmodel.find({},(err,data)=>{
            if(err) throw new Error(`Unable to fetch data`);
            //console.log(data)
            res.render('admin.ejs',{data: data});
          });
          //return res.send('<h1>Name: </h1>' + user.username + '<h2>Mail: </h2>' + user.email + '<br><a type="button" href="/logout">Logout</a>')
        }
      }
    });
});

// GET for logout logout
router.get('/logout', function (req, res, next) {
  if (req.session) {
    // delete session object
    req.session.destroy(function (err) {
      if (err) {
        return next(err);
      } else {
        return res.redirect('/');
      }
    });
  }
});

//forgot password
router.get('/forgot-password',function(req, res, next){
  res.render('forgotPassword.ejs',
  { data: {},
    errors: {}
  });
});

//new article
router.get('/new',(req, res, next)=>{
  console.log(`called`)
res.render('writeArticle.ejs');
});

//get injected scripts
  router.get('/getinjectedscripts',(req,res)=>{
   scriptToInjectModel.find({},(err,scripts)=>{
     if(err) res.send(500,err);
     res.send(scripts);
   });
  });

//edit article
router.get('/edit/:header',(req, res)=>{
   var editPathName = (req.params.header).split('-').join(' ');
  //console.log(editPathname)
  postmodel.findOne({header: editPathName},(err,data)=>{
    if(err) res.send(500,err);
   res.render('editArticle.ejs',{data: data.item});
  });
});

//send html from database
router.get('/html/:header',(req,res)=>{

})

//posts get route
router.get('/page/:page',cacheMiddleware(30),(req, res, next)=>{
  //console.log(req.session)
  var perPage = 4,
      page = req.params.page || 1;

  postmodel.find({})
           .skip((perPage * page) - perPage)
           .limit(perPage)
           .exec(function(err,data){
            if(err) res.send(500,err);
             postmodel.count().exec(function(err,count){
               if(err) return next(err);
               res.render('pages.ejs',{
                 data: data,
                 current: page,
                 pages: Math.ceil(count / perPage)
               });
             });
           });
    /*postmodel.find({},(err,data)=>{
      if(err) res.send(500,err);
       res.render('home.ejs',{data:data});
     });*/
 });
   
 //reset password with token 
  router.get('/reset/:token',(req,res,next)=>{
    var query = { resetPasswordToken: req.params.token,
       resetPasswordExpires: { $gt: Date.now() }
      } 
  user.findOne(query,(err, theuser)=>{
    if (!theuser) {  
      var error = new Error('Password reset token is invalid or has expired.')
      error.status = 400;
      return next(error)  ;
    }
     res.render('newPassword.ejs')
      });
  });

 //get first number of posts on the front page(4)
 router.get('/',(req,res,next)=>{
  postmodel.find({})
           .limit(4)
           .exec(function(err,data){
             if(err) res.send(500,err);
             postmodel.count().exec(function(err,count){
               if(err) return next(err);
              // res.json(data) -during testing
               res.render('home.ejs',{data: data})
             })
           })
 });

 //view specific article
 router.get('/:title',cacheMiddleware(30),(req, res, next)=>{
   //console.log(req.params.title)
   
   var header = (req.params.title).split('-').join(' ');
   
    postmodel.findOne({ title: header },(err, data)=>{
      var error =  new Error('This article is not available:(');
      if(err) {
        console.log(err)
        err.status = 404;
         return next(error);
      }

      //get object from array to avoid iterating in client

      // get and concatenate hostname with image url
      const hostName = req.headers.host;

      console.log(data)
    
      var imageURL = hostName + data._imageFromSearch;
      
      console.log(imageURL,`xoxo`)

      //build data for response 
       // console.log(data[0]._id)

       var dataObject = {
         title: data.title,
         body: data.body,
         _imageFromSearch: imageURL,
         hostName: hostName
       };
      

     //console.log(dataObject)
      //res.json(dataObject) -during testing
      //return res.json(dataObject)
      res.render('viewArticle',{ data: dataObject});
      
   });
 });


/**
 * GET /image/:photoID
 */
router.get('/image/:photoID', (req, res, next) => {
    //get images from req.params.photoID object

    try {
      var photoID = new ObjectID(req.params.photoID);
      //console.log(photoID)
    } catch(err) {
        console.log(err);
        var error = new Error("Invalid ImageID in URL parameter. Must be a single String of 12 bytes or a string of 24 hex characters");
        error.status = 400;
        //pass the error to the error handler
      return next(error);
    }
   
    let bucket = new mongoose.mongo.GridFSBucket(conn.db, {
      bucketName: 'photos'
    });
  
    let downloadStream = bucket.openDownloadStream(photoID);
  
    downloadStream.on('data', (chunk) => {
      res.write(chunk);
    });
  
    downloadStream.on('error', () => {
      res.sendStatus(404);
    });
  
    downloadStream.on('end', () => {
      res.end();
    });
  });
  
  
module.exports = router;