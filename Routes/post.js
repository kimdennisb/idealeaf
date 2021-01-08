var express = require('express');
const { config } = require('process');
const router = express.Router(),
    app = express(),
    bcrypt = require('bcryptjs'),
    {Readable} = require('stream'),
    multer=require('multer'),
    mongodb = require('mongodb'),
    mongoose = require('mongoose'),
    bodyParser = require('body-parser'),
    jsdom = require('jsdom'),
    session = require('express-session'),
    mongoStore = require('connect-mongo')(session),
    jimp = require('jimp'),
   { check, validationResult, matchedData } = require('express-validator'),
    crypto = require('crypto'),
    nodemailer = require('nodemailer'),
    postmodel = require('../Models/postSchema'),
    user = require('../Models/userSchema'),
    scriptToInjectModel = require('../Models/scriptToInjectSchema'),
    databaseConnection = require('../Database/database');

     //call database function
   let conn = databaseConnection();

    /*//parse incoming requests
    app.use(bodyParser.urlencoded({extended:true}));
    app.use(bodyParser.json());
    app.use(express.json({
      type: ['application/json','text/plain']
    }));*/


//sign up user
 router.post('/signup',(req,res,next)=>{
   // confirm that user typed same password twice
  if (req.body.password !== req.body.passwordConf) {
    var err = new Error('Passwords do not match.');
    err.status = 400;
    res.send("passwords don`t match");
    return next(err);
  }
  if (req.body.email &&
    req.body.password &&
    req.body.passwordConf) {

    var userData = {
      email: req.body.email,
      password: req.body.password,
      resetPasswordToken: '',
      resetPasswordExpires: ''
    }

    user.create(userData, function (error, user) {
      if (error) {
        return next(error);
      } else {
        console.log(req.session)
        req.session.userId = user._id;
        console.log(user._id)
        //return res.redirect('/profile');
      }
    });
  }

  
   });

   //sign in user
router.post('/signin',(req,res,next)=>{

  if (req.body.email && req.body.password) {
    user.authenticate(req.body.email, req.body.password, function (error, user) {
      if (error || !user) {
        var err = new Error('Wrong email or password.');
        err.status = 401;
        return next(err);
      } else {
        req.session.userId = user._id;
        return res.redirect('/admin');
      }
    });
  } else {
    var err = new Error('All fields required.');
    err.status = 400;
    return next(err);
  }
  
});
 
//reset password
router.post('/forgot-password',(req,res,next)=>{
const email = req.body.email;

//find user with this email address
user.findOne({ email: email })
    .then( async function(person){
      if(!person){
        var err = new Error('No user with that email address.');
        err.status = 404;
         return next(err);
      }
    
    //token is sent to the forgot password form
   const token = crypto.randomBytes(32).toString('hex');

   //set the resetpasswordtoken and resetpasswordexpires fields
   user.updateOne({email: email},
    { $set: 
    { resetPasswordToken: token,
      resetPasswordExpires: Date.now() + 3600000 }
    },(err,res)=>{
      if (err) throw err;
      console.log(`Document updated`);
    }); 

    var userEmail = person.email;
    

    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'kimutaidennisbrian@gmail.com',
        pass: 'kimutaidn1#'
      }
     });

     let mailOptions = {
      from : 'kimdennisb@gmail.com',
      to : userEmail,
      subject : 'Reset your whatspost password',
      text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +  
      'Please click on the following link, or paste this into your browser to complete the process:\n\n' +  
      'http://' + req.headers.host + '/reset/' + token + '\n\n' +  
      'If you did not request this, please ignore this email and your password will remain unchanged.\n' 
    }
     //send the email
    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
      console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });
  
        });
});

//reset password
router.post('/reset/:token',(req,res,next)=>{
  var query = { 
    resetPasswordToken: req.params.token,
    resetPasswordExpires: { 
       $gt: Date.now() 
      }
    };
    //find user with this token
   user.findOne(query,(err,theuser)=>{
    if (!user) {  
      res.json({message: 'Password reset token is invalid or has expired.'});  
  } 
  //if found,update the collection
  var myquery = { resetPasswordToken: req.params.token };  
  var newvalues = { $set: {
     password: req.body.password,
     resetPasswordToken:'',
     resetPasswordExpires:'', 
     modifiedDate : Date(Date.now()) 
    }
  };  
  user.updateOne(myquery,newvalues,(err,result)=>{
    if(err) throw err;
    console.log(`Password updated!`)
  })
})
});

/**
 * Resize and Store Images in Mongo GridFS
 * 
 * Multer adds a body object and a file or files object to the req object
 * 
 * Body object contains the values of text fields of the form,
 * the file or files object contains then files uploaded via the form
 * 
 * memory storage,the file info will contain a filed called buffer.
 */

const storage = multer.memoryStorage(),
      uploadImage = multer({ storage: storage, limits: { 
        fields: 12,
        fileSize: 1024 * 1024 * 18,
        file: 12,
        parts: 24 
      }
    });

router.post('/photos',uploadImage.array('photo',5), async (req,res)=>{
          //console.log(req.files)
          
         //iterate through the files array to perform file operations and return access IDS.
         var accessIDS = await Promise.all(req.files.map(async photo=>{

          if(!photo.originalname){
           // return res.status(400).json({ message: "No photo name in request file" }) 
           //assign an empty string to the photoName
           photo.originalname = "";
           }
          
           var urlArray = new Array();

           //sizes to use to resize images
           const sizes = [240,320,480];

           var imagesrcsets = [];

           await Promise.all(
             sizes.map(async size=>{
                 const image = await jimp.read(photo.buffer);
                 image.resize(size,jimp.AUTO);
                 image.quality(90);
                 image.getBuffer(jimp.AUTO,(err,buffer)=>{
                     if(err) console.error(err);
                     const photoName = photo.originalname + "-" + size;
                     const returnedURL = storeImage({ photoName,buffer });
                     imagesrcsets.push("/image/" + returnedURL + " " + size  + "w");
                 });
             })

           );
                
               //build the srcset nicely
               //console.log(imagesrcsets.join().length)
              const id = imagesrcsets.join();
              return id;
         
   })
   ); 
       // res.status(201).json({accessIDS});
       //console.log(accessIDS)
       //accessIDS will be used to send  an http get request for them to be rendered.
       res.send(accessIDS)
});

//store image helper function 
storeImage =(photo)=>{
           
  //initialize gridfs bucket
      let bucket = new mongoose.mongo.GridFSBucket(conn.db, {
       bucketName: 'photos'
     });
    let photoName = photo.photoName;
        
    // Covert buffer to Readable Stream
    const readablePhototream = new Readable();
    readablePhototream.push(photo.buffer);
    readablePhototream.push(null);
 
    let uploadStream = bucket.openUploadStream(photoName);
    let id = uploadStream.id;
    readablePhototream.pipe(uploadStream);
 
    uploadStream.on('error', () => {
      return res.status(500).json({ message: "Error uploading file" });
    });
    uploadStream.on('finish', () => {
      console.log(`"File uploaded successfully, stored under Mongo ObjectID: " ${id}`)
    });
    return id;
   }

router.post('/article',(req,res)=>{
          //console.log(req.body)
          
          //res.send(`Sucessfully received`);

          const article = {
            title : req.body.title,
            body : req.body.body
          }
        
          //grab the first image from the html string
        
         var _searchImageRegex = /<img\b(?=\s)(?=(?:[^>=]|='[^']*'|="[^"]*"|=[^'"][^\s>]*)*?\ssrc=['"]([^"]*)['"]?)(?:[^>=]|='[^']*'|="[^"]*"|=[^'"\s]*)*"\s?\/?>/

        //console.log(_searchImageRegex.exec(article.item))
         //search for an image in the HTML string,if found return the first image
         //else return a string 'noImageFound'
         //var _imageFromSearch =_searchImageRegex.exec(article.item)[1];
         _imageSearch = (htmlString)=>{ 
           if(_searchImageRegex.exec(htmlString)) return _searchImageRegex.exec(htmlString)[1];
           else return 'noImageFound';
         }

         //build the full article and save in the database
         const refinedArticle = {
          title: req.body.title,
          body: req.body.body,
          _imageFromSearch: _imageSearch(req.body.body)
        }

          
        var myposts = new postmodel(refinedArticle);
          /* create new article and 
          save it into the database
          */
          myposts.save((err,item)=>{
            if(err){
              res.send(err);
            } else {//if no errors,send it back to client
              res.json({message: "Article successfully added!",item });
            }
          });
        });
        
  router.post('/scriptToInject',(req, res)=>{
    console.log(req.body)
  var scriptToInject = new scriptToInjectModel({url : req.body.scriptToInject});
  scriptToInject.save((err,item)=>{
    if(err){
      res.send(err);
    }else {
      console.log(`saved successfully`)
    }
  })
  });
  
  //export the router
module.exports = router;