function setLayout (type){
    return function(req,res,next){
        if(type==="admin"){
            if(req.path==="login"){
                res.locals.layout=false
            }else{
                res.locals.layout="layouts/mainLayout"
            }
        }else if(type==="user"){
            res.locals.layout=false
        }

         next()
    } 
   
}

module.exports=setLayout