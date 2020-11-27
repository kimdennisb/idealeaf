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
    crypto = require('crypto'),
    nodemailer = require('nodemailer'),
    postmodel = require('../Models/postSchema'),
    user = require('../Models/userSchema'),
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

user.findOne({ email: email })
    .then( async function(person){
      if(!person){
        var err = new Error('No user with that email address.');
        err.status = 404;
        return next(err);
      }

      //use the user's id to destroy the credentials
      const accountID = person.id
       if(accountID){
        await  user.deleteOne({ _id: accountID})
       }
    
    //token is sent to the forgot password form
   const token = crypto.randomBytes(32).toString('hex');

  
   //hashing the password to be stored in database
   bcrypt.hash(token,10,function(err,hash){
     user.create({ email: req.body.email,password: hash})
         .then( async function(item){
           if(!item){
             var err = new Error('Failed to create new password.');
             err.status = 403;
             return next(err);
           }

           let testAccount = await nodemailer.createTestAccount();
           let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user:'kimdennisb@gmail.com',
              pass: "password"
            }
           });

           let mailOptions = {
             from : 'kimdennisb@gmail.com',
             to : person.email,
             subject : 'Reset your whatspost password',
             html : '<h1><b>Reset Password</b></h1>' + '<p>To reset your password,complete this form:</p>' + 
                     '<a href='+ 'config.clientUrl' + 'reset/' + person.id + '/' + token + ''>''
                       + '<br><br>' 
           }
           //sending mail to the user where password reset can be done.user id and token are sent as params in a link.
          let mailSent = await transporter.sendmail(mailOptions);
          console.log("Message sent: %s",mailSent.messageId)
          if(mailSent){
            return res.json({success: true,message: 'Check your mail to reset your password.'});
          }else {
            return res.json({message: 'Unable to send mail.'})
          }

         });
        })
   })
});

/**
 * Store Images in Mongo GridFS
 */

const storage = multer.memoryStorage(),
      uploadImage = multer({ storage: storage, limits: {fields: 12, fileSize: 1000 * 1000 * 18,file: 12, parts: 24 }});

router.post('/photos',uploadImage.array('photo',5), async (req,res)=>{
 //console.log(req.files)
          
         //iterate through the files array to perform file operations and return access IDS.
         var accessIDS = await Promise.all(req.files.map(async photo=>{

          if(!photo.originalname){
            return res.status(400).json({ message: "No photo name in request file" }) 
           }
          
           var urlArray = new Array();

           //resized image sizes
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
                     const returnedURL = storeImage({photoName,buffer});
                     imagesrcsets.push("/image/" + returnedURL + " " + size  + "w");
                 })
             })

           );
                
               //build the srcset nicely
               //console.log(imagesrcsets.join().length)
              const id = imagesrcsets.join();
              return id;
         
   })); 
       // res.status(201).json({accessIDS});
       console.log(accessIDS)
       res.send(accessIDS)
});

//store image  
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
            header : req.body.title,
            item : req.body.body
          }
        
          //grab the first image from the html string
          
         var _searchImageRegex = /<img\b(?=\s)(?=(?:[^>=]|='[^']*'|="[^"]*"|=[^'"][^\s>]*)*?\ssrc=['"]([^"]*)['"]?)(?:[^>=]|='[^']*'|="[^"]*"|=[^'"\s]*)*"\s?\/?>/

        //console.log(_searchImageRegex.exec(article.item))
         //try to search for an image in the HTML string
         //var _imageFromSearch =_searchImageRegex.exec(article.item)[1];
         _imageSearch = (htmlString)=>{ 
           if(_searchImageRegex.exec(htmlString)) return _searchImageRegex.exec(htmlString)[1];
           else return 'noImageFound';
         }

         //refined article
         const refinedArticle = {
          header : req.body.title,
          item : req.body.body,
          _imageFromSearch : _imageSearch(req.body.body)
        }

          //creates new article
        var myposts = new postmodel(refinedArticle);
          /* save it into the db */
          myposts.save((err,item)=>{
            if(err){
              res.send(err);
            } else {//if no errors,send it back to client
              res.json({message: "Article successfully added!",item });
            }
          });
        });
   
module.exports = router;