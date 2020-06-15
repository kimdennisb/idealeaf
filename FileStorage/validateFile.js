
var validateFile = function(file, cb ){
    const allowedFileTypes = /jpeg|jpg|png|gif/;
    const extension = allowedFileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimeType  = allowedFileTypes.test(file.mimetype);
     if(extension && mimeType){
      return cb(null, true);
    }else{
      cb("Invalid file type. Only JPEG, PNG and GIF file are allowed.")
    }
  };

module.exports = validateFile;