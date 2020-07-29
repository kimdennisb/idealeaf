var mongoose = require('mongoose'),
    MongoClient = require('mongodb').MongoClient,
    fs = require('fs'),
    path = require('path'),
    config = require('config');
 
    
   //database options
   let options = {
    server: { socketOptions: { keepAlive: 1,connectTimeoutMS: 30000 }},
    replset: { socketOptions: { keepAlive: 1,connectTimeoutMS: 30000 }}
  };

databaseConnection=()=>{
//mongoose.connect('mongodb://dbklify:kimutaidn1@ds259085.mlab.com:59085/dbklify');

//mongoose.connect(config.DBHost,{useNewUrlParser:true,useUnifiedTopology:false});
mongoose.connect(config.DBHost,options);
let conn = mongoose.connection;
conn.on('error',console.error.bind(console,'connection error'));
return conn;
}
/*
 ----github issue

function saveFile(b,p){
    return new Promise((resolve,reject)=>{
        //read from p
        fs.createReadStream(p)
        .pipe(b.openUploadStream(path.basename(p)))
        .on('error', function(err){ reject(err); })
        .on('finish', function(file){ resolve(file); });
    });
}

async function run(){
    await conn.dropDatabase();
    let opts = {
        bucketName: 'Photos'
    };
    const bucket = new mongoose.mongo.GridFSBucket(conn.db,opts);
    let res = await saveFile(bucket,'/path/to/store');
    console.log(res); 
    return conn.close()
}*/

module.exports = databaseConnection;

