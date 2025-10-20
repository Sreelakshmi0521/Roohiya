const errorHandler=(err,req,res,next)=>{
    console.error("error:",err.message)
    console.error(err.stack)



    const statusCode=err.status||500

    if(req.originalUrl.startsWith("/admin")){
        return res.status(statusCode).render("admin/error",{
            pageTitle:"Admin error",
            message:err.message||"something went wrong",
            layout:false,
            pagecss:"admin/error.css"
        })
    }
     if(req.originalUrl.startsWith("/user")){
        return res.status(statusCode).render("user/error",{
            pageTitle:"Oopss",
            message:err.message||"something went wrong",
           user:req.session.user||null,
           pagecss:"error.css"
        })
    }
      return res.status(statusCode).render("error", {
    pageTitle: "Oops!",
    message: err.message || "Something went wrong on this page",
    pagecss: "error.css"
  })

}
module.exports=errorHandler