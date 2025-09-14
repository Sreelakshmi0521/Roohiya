const isLogin=(req,res,next)=>{
    if(req.session.admin){
        res.redirect("/admin/dashboard")
    }else{
        next()
    }
}


const checkSession=(req,res,next)=>{
    if(!req.session.admin){
        return res.redirect("/admin/login")
    }
    next()
}

module.exports={isLogin,checkSession}