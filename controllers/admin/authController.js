const  Admin=require("../../models/adminModel")
const bcrypt=require("bcrypt")


const loadLogin=(req,res)=>{
    res.render("admin/login",{
        layout: false, 
        message:req.query.message||null,
        messageType:req.query.messageType||null,
        FormData:{
        }

    })
}

const adminLogin=async(req,res)=>{

    try {
      const {email,password}=req.body

    const admin=await Admin.findOne({email})
    if(!admin){
        console.log(admin)
        return res.render("admin/login",{
            message:"Invalid email or Password",
            messageType:"warning",
            layout: false,
            FormData:{email},

        })
        
    }
    const isMatch=await bcrypt.compare(password,admin.password)
    if(!isMatch){
         console.log(isMatch)
        return res.render("admin/login",{
            message:"invalid  password",
            messageType:"warning",
             layout: false,
            FormData:{email}
        })
    }

    req.session.admin={
        id:admin._id,
        email:admin.email
    }
     res.redirect("/admin/dashboard")

    } catch (error) {
        console.error(error)
        res.render("admin/login",{
            message:"something went wrong ",
            messageType:"warning",
             layout: false,
            FormData:{}
        })
        
    }
}

const loadDashboard=async(req,res)=>{
    try {
        if(!req.session.admin){
            return res.redirect("/admin/login")
        }
        const admin=await Admin.findById(req.session.admin.id)
           if (!admin) {
            req.session.destroy();
            return res.redirect("/admin/login");
        }

        res.render("admin/dashboard", {
            admin,
            message:req.query.message|| null,
            messageType:req.query.messageType|| null,
          
    
        });
    } catch (error) {
        console.error(error)
        res.status(500).send("Internal Server Error")
    }
}


const adminLogout=(req,res)=>{
req.session.destroy(error=>{
    if(error){
        console.error(error)
     return res.redirect("/admin/dashboard?message=Logout failed&messageType=warning");

    }
    res.clearCookie("connect.sid")
     res.redirect("/admin/login?message=Logged out successfully&messageType=success");

})
}


module.exports={
    loadLogin,
    adminLogin,
    loadDashboard,
    adminLogout

}
