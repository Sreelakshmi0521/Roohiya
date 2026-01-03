const User=require("../../models/userModel")
const cloudinary=require("../../config/cloudinary")
const { cleanupTempFiles } = require("../../utils/cleanUpTemp")
const {generateOtp}=require("../../helpers/otp")
const {sendVerificationEmail}=require("../../helpers/email")
const bcrypt=require("bcrypt")


const loadProfile=async(req,res,next)=>{
  try {
        if (!req.session.user) {
      return res.redirect("/user/login")
    }
    const userId=req.session.user.id
   const user=await User.findById(userId).lean()
   
   if(!user) throw new Error("User not found")
    res.render("user/profile",{
      user,
      activePage: 'profile'

   })
   
   
  } catch (error) {
    next(error)
  }
}

const loadEditProfile = async (req, res, next) => {
  try {
        if (!req.session.user) {
      return res.redirect("/user/login")
    }
    const userId=req.session.user.id
   const user=await User.findById(userId).lean()

   if (!user) throw new Error("User not found")

    res.render("user/editProfile", {
      user,
      isGoogleUser: user.isGoogleUser 
     
    })
  } catch (error) {
    next(error)
  }
}

const editProfile=async(req,res)=>{
  try {
  
  if(!req.session.user){
    return res.redirect("/user/login")
  }

  const userId=req.session.user.id
  const {name,email,phone}=req.body

  const user=await User.findById(userId)
    if (!user) return res.status(404).json({ success: false, message: "User not found" })
 
  if(req.file){
    const uploaded=await  cloudinary.uploader.upload(req.file.path,{
       folder: "user_profiles"
    })
        user.profileImage = uploaded.secure_url
            await cleanupTempFiles([req.file.path])
  }

  user.name=name
  user.phone=phone

  if(email && email!==user.email){
     const existingUser = await User.findOne({ email })
       if (existingUser && existingUser._id.toString() !== user._id.toString()) {
        return res.status(400).json({ success: false, message: "Email already in use" })
      }

    const otp=generateOtp()

    console.log("otp for change email:",otp)

    const otpSent=await sendVerificationEmail(email,otp,"emailChange")
      if(!otpSent){
        return res.status(500).json({ success: false, message: "Failed to send OTP" })
      }

      user.pendingEmail=email
      user.emailOtp=otp
      user.emailOtpExpires= new Date(Date.now() + 1 * 60 * 1000)
        await user.save()

        return res.json({success:true,redirectOtp:true,email})

  }
  await user.save()
//  console.log("hai")

  req.session.user.name=user.name
  req.session.user.phone=user.phone
  req.session.user.profileImage = user.profileImage

  res.json({ success: true, message: "Profile updated successfully" })

    
  } catch (error) {
   console.log(error)
    res.status(500).json({ success: false, message: "Server error" })
  }
}

const loadVerifyEmailOtpPage=(req,res)=>{
  try {
    const email =req.query.email||""
    res.render("user/verifyEmailOtp",{email})
  } catch (error) {
    console.error(error)
    res.status(500).render("error", { message: "Failed to load OTP page" })

  }
}

const  verifyEmailOtp=async(req,res)=>{
  try {
     const {email,otp}=req.body

if(!email||!otp){
    return res.json({ success: false, message: "Missing email or OTP" })
}
const user = await User.findOne({ pendingEmail: email })

if(!user){
 return res.json({ success: false, message: "User not found" })

}
if(!user.emailOtp||user.emailOtp!==otp.trim()){
 return res.json({ success: false, message: "Invalid OTP" })

}
if(!user.emailOtpExpires||user.emailOtpExpires< Date.now()){
  return res.json({ success: false, message: "OTP has expired" })

}
const existingUser=await User.findOne({ email: user.pendingEmail })
 if (existingUser && existingUser._id.toString() !== user._id.toString()) {
      return res.json({ success: false, message: "Email already in use" })
    }


    user.email = user.pendingEmail
    user.pendingEmail = null
    user.emailOtp = null
    user.emailOtpExpires = null
    await user.save()

    if(req.session.user){
      req.session.user.email=user.email
    }
    return res.json({ success: true, message: "Email verified successfully" })

  } catch (error) {
    console.error(error)
        return res.json({ success: false, message: "Server error" })

    
  }
}

const resendEmailOtp=async(req,res)=>{
  try {
    const {email}=req.body
    if(!email){
      return res.json({ success: false, message: "Email is required" })

    }

    const user=await User.findOne({ pendingEmail: email })
    if(!user){
      return res.json({ success: false, message: "User not found" })

    }
    if (user.emailOtpExpires && user.emailOtpExpires > Date.now()) {
      return res.json({success: false,message: "Please wait before requesting another OTP"})
    }
    const otp=generateOtp()
        console.log("Resend OTP for change email:", otp)

        const sent =await sendVerificationEmail(email,otp,"emailChange")
        if(!sent){
       return res.json({ success: false, message: "Failed to send OTP" })
         
        }

        user.emailOtp=otp
        user.emailOtpExpires= new Date(Date.now() + 1 * 60 * 1000)
        await user.save()
         return res.json({success: true,message: "New OTP sent successfully to your email"})

  } catch (error) {
    console.error(error)
    return res.json({ success: false, message: "Server error" })

  }
}


const loadChangePasswordPage = (req, res) => {
  const email = req.query.email || req.session.user?.email
  const isForgotFlow = req.query.forgot === "true" ? true : false

  if (!email) {
    return res.redirect("/user/login")
  }

  res.render("user/changePassword", {
    userEmail: email,
    isForgotFlow
  });
};


const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword, confirmPassword, email, isForgotFlow } = req.body;


    if (!newPassword || !confirmPassword) {
      return res.json({ success: false, message: "All fields are required" })
    }

    if (newPassword !== confirmPassword) {
      return res.json({ success: false, message: "Passwords do not match" })
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "User not found" })
    }

    if (!isForgotFlow) {
      if (!oldPassword) {
        return res.json({ success: false, message: "Old password is required" });
      }

      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) {
        return res.json({ success: false, message: "Old password is incorrect" });
      }
    }

   
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();
if (req.session) {
  req.session.destroy((err) => {
    if (err) console.log( err)
    return res.json({success: true, message: "Password changed successfully. Please log in again." })
  })
} else {
  return res.json({ success: true,   message: "Password changed successfully. Please log in again." })
}


    

  } catch (error) {
    console.error(error);
    return res.json({ success: false, message: "Server error" });
  }
};



const loadForgotPasswordPage = (req, res) => {
  res.render("user/forgotChangePassword");
};

const sendResetPasswordOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.json({ success: false, message: "User not found" });

    const otp = generateOtp();
    console.log("forgot changePassword:",otp)
    user.resetPasswordOtp = otp;
    user.resetPasswordOtpExpires = Date.now() + 3 * 60 * 1000;
    await user.save();

    await sendVerificationEmail(email, otp, "forgot");
    res.json({ success: true, message: "OTP sent to your email" });
  } catch (err) {
    console.error(err);
    res.json({ success: false, message: "Server error" });
  }
};

const loadResetForgotPasswordPage = (req, res) => {
  try {
    const email = req.query.email;
    if (!email) return res.redirect("/user/forgotChangePassword");

    res.render("user/resetForgotChangePassword", { email });
  } catch (error) {
    console.error(error);
    res.redirect("/user/forgotChangePassword");
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.json({ success: false, message: "User not found" });

    if (user.resetPasswordOtp !== otp || Date.now() > user.resetPasswordOtpExpires) {
      return res.json({ success: false, message: "Invalid or expired OTP" });
    }
console.log("hai")
    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordOtp = null;
    user.resetPasswordOtpExpires = null;
    await user.save();

    res.json({ success: true, message: "Password reset successfully" });
  } catch (err) {
    console.error(err);
    res.json({ success: false, message: "Server error" });
  }
};







module.exports={
   loadProfile,
     loadEditProfile,
     editProfile,
      verifyEmailOtp,
      resendEmailOtp,
      loadVerifyEmailOtpPage,
      loadChangePasswordPage,
      changePassword  ,
      loadForgotPasswordPage ,
       sendResetPasswordOtp,
       loadResetForgotPasswordPage,
       resetPassword
}