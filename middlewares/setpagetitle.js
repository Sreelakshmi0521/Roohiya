const setPagetitle=(pageTitle,pagecss=null)=>{
    return(req,res,next)=>{
        res.locals.pageTitle =pageTitle;
        res.locals.pagecss =pagecss; 
        next()
    }

}

module.exports=setPagetitle