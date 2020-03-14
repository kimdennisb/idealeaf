'use strict';

var express=require('express');
var app=express();
var mongoose=require('mongoose');
var bodyParser=require('body-parser');
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
var bcrypt=require('bcryptjs');
var multer=require('multer');
const path=require('path');
var cache=require("memory-cache");
 
const port=process.env.PORT || 3000
//connecting to mongodb 
mongoose.connect('mongodb://dbklify:kimutaidn1@ds259085.mlab.com:59085/dbklify');
//mongoose.connect('mongodb://localhost/DKBAPP',{useNewUrlParser:true});

//userloginSchema
var userSchema=new mongoose.Schema({
    email:{
        type:String,
        required:true,
        index:{
            unique:true
        }
    },
    password:{
        type:String,
        required:true
    }
});
const credentials=mongoose.model('credentials',userSchema);

//posts schema
var postSchema=new mongoose.Schema({
  photos:  {
       type: String 
},
header:{
    type:String,
    required:true
},
item:{
  type:String
}
});
var postmodel=mongoose.model('postmodel',postSchema);

//setting the view engine
app.set('view engine','ejs');
 
//serving static files
app.use(express.static('./public'));

//configuring cache middleware
let memCache=new cache.Cache();
let cacheMiddleware=(duration)=>{
  return (req,res,next)=>{
    let key='__express__' + req.originalUrl || req.url
    let cacheContent=cache.get(key);
    if(cacheContent){
      res.send(cacheContent);
      return
    }else{
      res.sendResponse=res.send;
      res.send=(body)=>{
        memCache.put(key,body,duration*1000);
        res.sendResponse(body);
      }
      next()
    }
  }
}

/** Storage Engine for images*/
const storageEngine = multer.diskStorage({
    destination: './public/files',
  filename: function(req, file, fn){
      fn(null,  new Date().getTime().toString()+'-'+ file.originalname);
    } 
  }); 
  
  const upload =  multer({
     storage: storageEngine,
   fileFilter: function(req, file, callback){
      validateFile(file, callback);
    }
  }).array('photos',5);
  
  var validateFile = function(file, cb ){
    const allowedFileTypes = /jpeg|jpg|png|gif/;
    const extension = allowedFileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimeType  = allowedFileTypes.test(file.mimetype);
    if(extension && mimeType){
      return cb(null, true);
    }else{
      cb("Invalid file type. Only JPEG, PNG and GIF file are allowed.")
    }
  }
  
//registering the credentials and hashing the password.
 app.post('/signup',(req,res)=>{
     bcrypt.genSalt(10,(err,salt)=>{
         bcrypt.hash(req.body.password,salt,(err,hash)=>{
             if(err) next(err);

             var userData={
                email:req.body.email,
               password:hash
            };
            credentials.create(userData,(err,user)=>{
                if(err) throw err;
               res.render('landingPage.ejs');
            })
         })
     })
    })
   
//getting the landing page
app.get('/register',(req,res)=>{
    res.render('landingPage.ejs'); 
});

//delete route
app.delete('/userAdmin',(req,res)=>{
  postmodel.findOne({header:req.body.header},
    (err,result)=>{
      if(err) res.send(500,err);
      res.send({message:'A post was deleted'})
      result.remove((err,result1)=>{
        if(err) throw err;
      })
    })
})

//getting login page after registering and verifying credentials.
app.post('/loginfordenniskim',(req,res)=>{
    credentials.findOne({},(err,data)=>{
        if(err) throw err;
      bcrypt.compare(req.body.memberPassword,data.password,(err,res1)=>{
          if(err) throw err;
          //returns true if the input password and hashed are same
          if(res1==true){
              postmodel.find({},(err,data)=>{
                res.render('userAdmin.ejs',{data:data});
              })
          }else{
         res.render('login.ejs')
          }
      })
      
    })
})

app.get('/Login',(req,res)=>{
    res.render('login.ejs')
})

//posts get route
app.get('/',cacheMiddleware(30),(req,res)=>{
   postmodel.find({},(err,data)=>{
    res.locals.blogData = data;
      res.render('posts.ejs',{data:data});
    })
})

//rerouting route
app.get('/:header',cacheMiddleware(30),(req,res)=>{
postmodel.find({header:req.params.header},(err,data)=>{
    res.render('viewpost',{data:data})
})
})

//posts post route
app.post('/userAdmin',(req,res)=>{
  upload(req, res,(error) => {
    if(error){
       res.redirect('/');
    }else{
      if(req.files == undefined){
        res.redirect('/');
      }else{
        
           
          /**
           * Create new record in mongoDB
           */
      
  let finalimageProperties=req.files.map((imageProperties)=>{
   let convertedImage=Object.keys(imageProperties).map((key)=>{
      return imageProperties[key];
    })
    return convertedImage;
  })

  var nameCollections=finalimageProperties.map((getimageName)=>{
   return 'files/' + getimageName[5];
  })

          var document = {
            photos:nameCollections, 
            header:req.body.header,
            item:req.body.item
          };

          var myposts=new postmodel(document);
          myposts.save().then((result)=>{
              postmodel.find({},(err,data)=>{
                  res.render('userAdmin.ejs',{data:data});
                })
          }).catch((err)=>{
              if (err) throw err;
          })
        
        }
  }
});      
        });
   

app.listen(port,()=>{
  console.log(`listening on the port ${port}`)
});


