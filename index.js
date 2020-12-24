'use strict';

//modules
var express=require('express'),
    app=express(),
    mongoose=require('mongoose'),
    mongodb = require('mongodb'),
    MongoClient = require('mongodb').MongoClient,
    ObjectID = require('mongodb').ObjectID,
   bodyParser=require('body-parser'),
   path = require('path'),
   swal = require('sweetalert'),
   ejs = require('ejs'),
   config = require('config'),
   morgan = require('morgan'),
   session = require('express-session'),
   mongoStore = require('connect-mongo')(session),
   databaseConnection = require('./Database/database');
//don't show the log when it is test
if(config.util.getEnv('NODE_ENV' !== 'test')){
  //use morgan to log at command line
app.use(morgan('combined'));//'combined' outputs the Apache style LOGs
}

const port = process.env.PORT || 3000;
 
var get = require('./Routes/get'),
    remove = require('./Routes/delete'),
    post = require('./Routes/post')
    //update = require('./Routes/update');

//serving static files
app.use(express.static(path.join(__dirname,'public')));

//making the static files available on /edit path
app.use('/edit',express.static(path.join(__dirname,'public')));

//setting the view engine and for server to look at the views folder
app.set('views',path.join(__dirname,'Views'));
app.set('view engine','ejs');

//parse data from the form
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

//database object
databaseConnection();

//get connecion object
let conn = databaseConnection();

//use sessions for tracking logins
app.use(session({
  secret: 'work hard',
  resave: true,
  saveUninitialized: false,
  store: new mongoStore({
    mongooseConnection: conn
  })
}));

//use routes
app.use('/',get);
app.use('/',post);
app.use('/',remove);
//app.use('/update',update);

 // catch 404 and forward to error handler
 app.use(function (req, res, next) {
   
  /*
  //facilitate the right error message
  var err = new Error('File Not Found');
  err.status = 404;*/
  next(err);
});

// error handler
// define as the last app.use callback
app.use(function (err, req, res, next) {
  res.status(err.status || 500)
  //res.json(err.message);
  res.json(err.message)
});

app.listen(port,()=>{
  console.log(`listening on the port ${port}`)
});

module.exports = app; //for testing

/************
 * 
 * 
 * 
 * :)
 * 
 *
 *
 ************/