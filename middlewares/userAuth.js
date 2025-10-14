
const User=require("../models/userModel")

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

const checkUserBlocked=async(req,res,next)=>{
    try {
         if(!req.session.user){
        return next()
    }
    const user=await User.findById(req.session.user.id).select("isBlocked")

    if(!user||user.isBlocked){
        req.session.destroy(error=>{
            if(error){
            console.error(error)
          return res.redirect("/user/login")
            }
          return res.redirect("/user/login")
        })
    }else{
        next()
    }
    } catch (error) {
        console.error(error)
         return res.redirect("/user/login")
    }
   
}


module.exports={ isLogin,requireLogin,requireTempuser,checkUserBlocked}
