const express=require("express")
const router =express.Router()
const authController=require("../controllers/user/authController")
const passport = require("passport")
const nocache=require("../middlewares/nocache")
const {isLogin,requireLogin,requireTempuser,checkUserBlocked,checkBlockedGoogleUser}=require("../middlewares/userAuth")
const setLayout=require("../middlewares/setLayout")
const userController=require("../controllers/user/userController")
const setPagetitle=require("../middlewares/setpagetitle")
const productController=require("../controllers/user/productController")
const reviewController=require("../controllers/user/reviewController")
const profileController=require("../controllers/user/profileController")
const addressController=require("../controllers/user/addressController")
const upload = require("../middlewares/upload")

router.use(setLayout("user"))
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


router.get("/homepage",requireLogin,checkUserBlocked,nocache,setPagetitle("homepage","homepage.css"),userController.loadHomepage)
router.get("/shop",checkUserBlocked,nocache,setPagetitle("shop","shop.css"),productController.loadShop)
router.get("/product/:id",checkUserBlocked,nocache,productController.loadProductDetails)
router.post("/review/add",requireLogin,reviewController.addReview)

//profile

router.get("/profile",requireLogin,checkUserBlocked,nocache,setPagetitle("profile","profile.css"),profileController.loadProfile)
router.get("/editProfile",requireLogin,nocache,setPagetitle("editProfile","editProfile.css"),profileController.loadEditProfile)
router.post("/editProfile",requireLogin,upload.single("profileImage"),setPagetitle("editProfile","editProfile.css"),profileController.editProfile)
router.get("/verifyEmailOtp", requireLogin, nocache, profileController.loadVerifyEmailOtpPage);
router.post("/verifyEmailOtp",requireLogin,profileController.verifyEmailOtp)
router.post("/resendEmailOtp", requireLogin,profileController.resendEmailOtp)

// newpassword
router.get("/changePassword",nocache,profileController.loadChangePasswordPage)
router.post("/changePassword",nocache,profileController.changePassword)

router.get("/forgotChangePassword", profileController.loadForgotPasswordPage)
router.post("/sendResetPasswordOtp", profileController.sendResetPasswordOtp)
router.get("/resetForgotChangePassword", profileController.loadResetForgotPasswordPage)
router.post("/resetPassword", profileController.resetPassword)

// // address
router.get("/addresses",requireLogin,setPagetitle("My Addresses", "addresses.css"),addressController.loadAddressesPage);




module.exports=router