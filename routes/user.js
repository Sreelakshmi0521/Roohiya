const express=require("express")
const router =express.Router()
const authController=require("../controllers/user/authController")
const passport = require("passport")
const nocache=require("../middlewares/nocache")
const {isLogin,requireLogin,requireTempuser}=require("../middlewares/userAuth")


//signup
router.get("/signup",isLogin,nocache,authController.loadSignup)
router.post("/signup",authController.signupUser)


//otp
router.get("/verifyOtp",requireTempuser,nocache,authController.loadVerifyOtp)
router.post("/verifyOtp",requireTempuser, authController.verifyOtp);
router.post("/resendOtp",requireTempuser,authController.resendOtp)

//google auth
router.get("/auth/google",passport.authenticate("google",{scope:["profile","email"]}))
router.get("/auth/google/callback",passport.authenticate("google", { failureRedirect: "/user/signup" }),authController.googleLogin)

//login
router.get("/login",isLogin,nocache,authController.loadLogin)
router.post("/login",authController.loginUser)

router.get("/homepage",requireLogin,nocache,authController.loadHomepage)







module.exports=router