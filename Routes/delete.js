var express = require('express')
    router = express.Router(),
    postmodel = require('../Models/postSchema')

//delete route
router.delete('/delete',(req,res)=>{
    postmodel.findOne({header:req.body.header},//res.body.header is sent through fetch request
      (err,result)=>{
        if(err) res.send(500,err);
        result.remove((err,result1)=>{
          if(err) throw err;
          res.send({message:'A post was deleted',result1})
        });
      });
  });

  module.exports = router;
