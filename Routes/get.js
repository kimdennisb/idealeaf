var express = require('express');

   const router = express.Router(),
    cacheMiddleware = require('../Cache/cache'),
    postmodel = require('../Models/postSchema'),
    databaseConnection = require('../Database/database'),
    ObjectID = require('mongodb').ObjectID,
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
  res.render('forgotPassword.ejs');
});

//new article
router.get('/new',(req, res, next)=>{
  console.log(`called`)
res.render('writeArticle.ejs');
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
router.get('/page/:page',cacheMiddleware(30),(req,res,next)=>{
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
 router.get('/:header',cacheMiddleware(30),(req,res)=>{
   //console.log(req.params.header)
 
   var header = (req.params.header).split('-').join(' ');
    postmodel.find({header:header},(err,data)=>{
      if(err) res.send(500,err);

      //get object from array to avoid iterating in client
      const dataObject = data[0];
      console.log(dataObject)
      //res.json(dataObject) -during testing
      res.render('viewArticle',{data: dataObject});
 });
 });


/**
 * GET /image/:photoID
 */
router.get('/image/:photoID', (req, res) => {
    //get images from req.params.photoID object
    try {
      var photoID = new ObjectID(req.params.photoID);
      console.log(photoID)
    } catch(err) {
        console.log(err)
      return res.status(400).json({ message: "Invalid ImageID in URL parameter. Must be a single String of 12 bytes or a string of 24 hex characters" }); 
    }
    /*res.set('content-type', 'audio/mp3');
    res.set('accept-ranges', 'bytes');*/
  
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