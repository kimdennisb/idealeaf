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
   databaseConnection = require('./Database/database');

//don't show the log when it is test
if(config.util.getEnv('NODE_ENV' !== 'test')){
  //use morgan to log at command line
app.use(morgan('combined'));//'combined' outputs the Apache style LOGs
}
 
var get = require('./Routes/get'),
    remove = require('./Routes/delete'),
    post = require('./Routes/post')
    //update = require('./Routes/update');

const port = process.env.PORT || 3000;

//setting the view engine
app.set('view engine','ejs');

app.set('views', path.join(__dirname, 'views'));
 
//serving static files
app.use(express.static(path.join(__dirname,'Public')));

//making the static files available on /edit path
app.use('/edit',express.static(path.join(__dirname,'Public')));

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

//provide acess to sweetalert functions
app.locals.sweetAlert = swal;

//use routes
app.use('/',get);
app.use('/',post);
app.use('/',remove);
//app.use('/update',update);

 // catch 404 and forward to error handler
 app.use(function (req, res, next) {
  var err = new Error('File Not Found');
  err.status = 404;
  next(err);
});

// error handler
// define as the last app.use callback
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.send(err.message);
});

app.listen(port,()=>{
  console.log(`listening on the port ${port}`)
});

module.exports = app; //for testing

/************
 * 
 * 
 * 
 * Nice of you reaching here:)
 * 
 *
 *
 ************/