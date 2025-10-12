const express=require("express")
const router =express.Router()
const authController=require("../controllers/user/authController")
const passport = require("passport")
const nocache=require("../middlewares/nocache")
const {isLogin,requireLogin,requireTempuser}=require("../middlewares/userAuth")
const setLayout=require("../middlewares/setLayout")
const userController=require("../controllers/user/userController")
const setPagetitle=require("../middlewares/setpagetitle")
const productController=require("../controllers/user/productController")
const reviewController=require("../controllers/user/reviewController")

router.use(setLayout("user"))
//signup
router.get("/signup",isLogin,nocache,setPagetitle("Sign Up - Roohiya","signup.css"),authController.loadSignup)
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


router.get("/homepage",requireLogin,nocache,setPagetitle("homepage","homepage.css"),userController.loadHomepage)
router.get("/shop",nocache,setPagetitle("shop","shop.css"),productController.loadShop)
router.get("/product/:id",nocache,productController.loadProductDetails)
router.post("/review/add",requireLogin,reviewController.addReview)




module.exports=router