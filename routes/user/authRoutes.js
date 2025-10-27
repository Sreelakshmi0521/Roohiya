const express=require("express")
const router =express.Router()
const passport = require("passport")
const nocache=require("../../middlewares/nocache")
const {isLogin,requireLogin,requireTempuser,checkBlockedGoogleUser}=require("../../middlewares/userAuth")
const authController=require("../../controllers/user/authController")
const userController=require("../../controllers/user/userController")
const setPagetitle=require("../../middlewares/setpagetitle")


//signup
router.get("/signup",isLogin,nocache,setPagetitle("Sign Up - Roohiya","signup.css"),authController.loadSignup)
router.post("/signup",authController.signupUser)

//otp
router.get("/verifyOtp",requireTempuser,nocache,authController.loadVerifyOtp)
router.post("/verifyOtp",requireTempuser, authController.verifyOtp)
router.post("/resendOtp",requireTempuser,authController.resendOtp)

//google auth
router.get("/auth/google",passport.authenticate("google",{scope:["profile","email"]}))
router.get("/auth/google/callback",passport.authenticate("google", { failureRedirect: "/user/signup",session:true }),checkBlockedGoogleUser,authController.googleLogin)

//login
router.get("/login",isLogin,nocache,authController.loadLogin)
router.post("/login",authController.loginUser)
//logout
router.get("/logout",requireLogin,userController.logout)


//forgot password
router.get("/forgotPassword",authController.loadForpassEmail)
router.post("/forgotPassword",authController.sendRecoverOtp)
router.get("/recoveryOtp",authController.loadRecoveryOtp)
router.post("/recoveryOtp",authController.recoveryOtp)
router.post("/resendRecoveryOtp",authController.resendRecoveryOtp)
router.get("/newForpassword",authController.loadNewpassword)
router.post("/newForpassword",authController.newForpassword)



module.exports=router