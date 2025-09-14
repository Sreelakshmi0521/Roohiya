const isLogin=(req,res,next)=>{
    if(req.session.user){
        return res.redirect("/user/homepage")
    }
    if(req.session.tempUser){
        return res.redirect("/user/verifyOtp")
    }
    next()
}


const requireLogin=(req,res,next)=>{
    if(!req.session.user){
        return  res.redirect("/user/login")
    }
    next()
}
const requireTempuser=(req,res,next)=>{
    if(!req.session.tempUser){
        return res.redirect("/user/signup")
    }
    next()
}

module.exports={ isLogin,requireLogin,requireTempuser}
