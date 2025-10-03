const User=require("../../models/userModel")
const bcrypt=require("bcrypt")
const {generateOtp}=require("../../helpers/otp")
const {sendVerificationEmail}=require("../../helpers/email")
const {validationSignup,validationLogin}=require("../../helpers/formValidation")


// sign Up
const loadSignup=(req,res)=>{
    res.render("user/signup",{
        message:null,
        messageType:null,
         formData:{}
    })   
}
const signupUser=async(req,res)=>{
   
    try{
        // console.log(req.body)
        const {name,email,phone,password,confirmPassword }=req.body
        const  formData={name,email,phone}


        const errors=validationSignup({name,email,phone,password,confirmPassword});
        if(errors.length>0){
            return res.render("user/signup",{
                message:errors[0],
                messageType:"warning",
                formData:{name,email,phone}
            })

        }
        const existingUser =await User.findOne({
            $or:[{email},{phone}]
        })
        if(existingUser){
         return res.render("user/signup", {
        message: "User already exists with this email or phone",
        messageType:"warning",
        formData
         });
        }
        
        const hashedPassword=await bcrypt.hash(password,10)

        req.session.tempUser={name,email,phone,password:hashedPassword}
        console.log( req.session.tempUser)

        
        // otp generation

       const otp=generateOtp()

       const sentEmail=await sendVerificationEmail(email,otp)
        if (!sentEmail) {
            return res.render("user/signup", {
                message: "Failed to send OTP, try again later.",
                messageType: "warning",
                formData
            });
        }

         req.session.otp=otp
         req.session.otpExpiry = Date.now() +1* 60 * 1000;
         res.redirect("/user/verifyOtp");
         console.log("otp",otp)



    }catch(error){
        console.log(error)
        res.render("user/signup", {
       message: "Something went wrong",
       messageType:"warning",
       formData : req.body
     });
    }

}

//verify otp
const loadVerifyOtp=(req,res)=>{
    res.render("user/verifyOtp",{
        message:null,
        messageType:null
    })
}

const verifyOtp=async(req,res)=>{
    try {
        let {otp}=req.body

        if(!otp||!/^\d{6}$/.test(otp)){
            return res.json({success:false,message:"OTP must be 6 digits."})
        }
        if(!req.session.otp||!req.session.tempUser){
            return res.json({success:false,message:"OTP not found. Please signup again." })
        }
        if(Date.now()>req.session.otpExpiry){
            req.session.tempUser=null
            req.session.otp=null;
            req.session.otpExpiry=null
            return res.json({success:false,message:"OTP expired. Please resend OTP."})
        }
        if (otp !== req.session.otp) {
        return res.json({ success: false, message: "Incorrect OTP. Try again." });
        }
          const newUser= new User(req.session.tempUser)
          await newUser.save()

        req.session.user = { id: newUser._id, name: newUser.name, email: newUser.email }

         req.session.tempUser=null
         req.session.otp=null
         req.session.otpExpiry=null

        return res.json({ success: true, message: "OTP verified successfully!" });

    } catch (error) {
         console.log(error);
        return res.json({ success: false, message: "Something went wrong. Please try again." });
    
    }
}


// resend otp

const resendOtp=async(req,res)=>{
    try{
    if(!req.session.tempUser){
        return res.json({success:false,message: "No user data found. Please signup again."})
    }
    
    const email=req.session.tempUser.email
    const otp=generateOtp()
    const sentEmail=await sendVerificationEmail(email,otp)

    if(!sentEmail){
        return res.json({success:false,message: "Failed to resend OTP. Try again later."})
    }
    
        req.session.otp = otp;
        req.session.otpExpiry = Date.now() + 1 * 60 * 1000;
        console.log("resend otp",otp) 
              return res.json({ success: true, message: "A new OTP has been sent to your email." });

    } catch (error) {
        console.log(error);
        return res.json({ success: false, message: "Something went wrong while resending OTP." });
    }
 }

 //login
 const loadLogin=(req,res)=>{
    res.render("user/login",{
        message:null,
        messageType:null,
        formData:null
    })
 }
 const loginUser=async(req,res)=>{
    try {
        const {email,password}=req.body

         const errors=validationLogin({email,password});
        if(errors.length>0){
            return res.render("user/login",{
                message:errors[0],
                messageType:"warning",
                formData:{email}
            })
        }

        if(!email||!password){
            return res.render("user/login",{
                message:"All fields are required",
                messageType:"warning",
                formData:{email}
            })
        }

        const user=await User.findOne({email})

        if(!user){
            return res.render("user/login",{
                message:"Invalid email or password",
                messageType:"warning",
                formData: { email } 
            })
        }
        if(user.isBlocked){
            return res.render("user/login",{
                message:"Your account has been blocked ",
                messageType:"warning",
                formData:{email}
            })
        }


        const passMatch= await bcrypt.compare(password,user.password)
        if(!passMatch){
            return res.render("user/login",{
                message:"Invalid password",
                messageType:"warning",
                formData:{email}
            })
        }


        req.session.user={
            id:user._id,
            name:user.name,
            email:user.email
        }

        res.redirect("/user/homepage")


    } catch (error) {
        console.log(error);
        res.render("user/login",{
            message: "Something went wrong. Please try again",
            messageType: "warning",
            formData: { email: req.body.email }
        });
        
    }
 }
const googleLogin = (req, res) => {
    try {

        if (req.user.isBlocked) {
    req.logout?.();
    return res.redirect("/user/login?blocked=true&email=" + encodeURIComponent(req.user.email));
}

        if (req.user) {
            req.session.user ={
                id:req.user._id,
                email:req.user.email
            }
            return res.redirect("/user/homepage");
        } else {
            return res.redirect("/user/login");
        }

        
    } catch (error) {
        return res.redirect("/user/login");
    }
}

//forgot password

const loadForpassEmail=(req,res)=>{
    res.render("user/forgotPassword",{
        message:null,
        messageType:null
    })
}

//email verify for otp
const sendRecoverOtp=async(req,res)=>{
    try{
    const {email}=req.body

    if(!email){
        return res.json({success:false,message:"email is required"})
    }

    const user =await User.findOne({email})
    if(!user){
        return res.json({success:false,message:"email not registered"})
    }

    if (req.session.recoveryEmail && req.session.recoverOtp && Date.now() < req.session.recoverOtpExpiry) {
            return res.json({ success: false, message: " OTP already send. Please wait until it expires." });
        }
    
   
        const otp=generateOtp()
    req.session.recoverOtp=otp
    req.session.recoverOtpExpiry= Date.now() + 1 * 60 * 1000
    req.session.recoveryEmail = email
    console.log(otp)

     const sentEmail=await sendVerificationEmail(email,otp,"forgot")
    if (!sentEmail){
         return res.json({ success: false, message: "Failed to send OTP" })
    }

    res.json({ success: true, message: "OTP sent to your email" })
   
}catch (error) {
        console.error(error);
        res.json({ success: false, message: "Something went wrong. Try again" });
    }


}

const loadRecoveryOtp=(req,res)=>{
     res.render("user/recoveryOtp",{
        message:null,
        messageType:null
     })
}
const recoveryOtp=async(req,res)=>{
    try {
        let {otp}=req.body

        if(!otp||!/^\d{6}$/.test(otp)){
            return res.json({success:false,message:"OTP must be 6 digits."})
        }
        if(!req.session.recoverOtp||!req.session.recoveryEmail){
            return res.json({success:false,message:"No OTP Found. Try again"})
        }
        if(Date.now() > req.session.recoverOtpExpiry){
            req.session.recoverOtp=null
            req.session.recoverOtpExpiry=null
            req.session.recoveryEmail=null
           return res.json({success:false,message: "OTP expired. Please resend."})
        }
        if(otp!==req.session.recoverOtp){
            return res.json({success:false,message:"Incorrect OTP,Try again"})
        }
        req.session.verifiedRecoveryEmail=req.session.recoveryEmail

        req.session.recoverOtp=null
        req.session.recoverOtpExpiry=null
        return res.json({success:true,message: "OTP verified successfully!"})
   
    } catch (error) {
        console.log(error)
        return res.json({success:false,message: "Something went wrong while verifying OTP."})
    }
}

//resend recovery otp
const resendRecoveryOtp=async(req,res)=>{
  try {
    if(!req.session.recoveryEmail){
        return res.json({success:false,message:"No recovery email found.Try again"})
    }
    const otp=generateOtp()
    req.session.recoverOtp=otp
    req.session.recoverOtpExpiry=Date.now()+1 * 60 * 1000
    console.log("resend recovery otp:",otp )

    const sentEmail=await sendVerificationEmail(req.session.recoveryEmail,otp,"forgot")

    if(!sentEmail){
        return res.json({success:false,message:"Failed to resend OTP,try again"})
    }
  
    // console.log("resend recov otp:",otp)

  return res.json({success:true,message: "A new OTP has been sent to your email."})

  } catch (error) {
    console.error(error)
    return res.json({success:false,message: "Something went wrong while resending OTP."})
  }
}
const loadNewpassword=(req,res)=>{
    if(!req.session.verifiedRecoveryEmail){
        return res.redirect("/user/forgotPassword")
    }
    res.render("user/newForpassword",{
        message:null,
        messageType:null
    })
}
const newForpassword=async(req,res)=>{
    try {
        const {newPassword,confirmPassword}=req.body

        if(!newPassword||!confirmPassword){
            return res.json({success:false,message:"All fields are required"})
        }
        if(newPassword!==confirmPassword){
            return res.json({success:false,message:"Incorrect password"})
        }
        
        const hashedPassword= await bcrypt.hash(newPassword,10)

        const updatepass= await User.findOneAndUpdate(
            {email:req.session.verifiedRecoveryEmail},
            {$set:{password:hashedPassword}}
        )
        console.log(updatepass)

        req.session.verifiedRecoveryEmail=null
        
        return res.json({success:true,message:"Password reset successfully!"})
        
         
    } catch (error) {
        console.error(error);
       return res.json({ success: false, message: "Something went wrong." })
        
    }
}

const loadHomepage=(req,res)=>{
    res.render("user/homepage",{ 
    user: req.session.user || {} 
})
}

module.exports={
    loadSignup,
    signupUser,
    loadHomepage,
    loadVerifyOtp,
    verifyOtp,
    resendOtp,
    loadLogin,
    loginUser,
    googleLogin,
   loadForpassEmail,
    sendRecoverOtp,
    loadRecoveryOtp,
     recoveryOtp,
    resendRecoveryOtp,
    loadNewpassword,
    newForpassword
}