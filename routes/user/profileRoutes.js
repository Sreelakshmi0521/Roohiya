const express=require("express")
const router =express.Router()
const nocache=require("../../middlewares/nocache")
const {requireLogin,checkUserBlocked}=require("../../middlewares/userAuth")
// const setLayout=require("../middlewares/setLayout")
const setPagetitle=require("../../middlewares/setpagetitle")
const upload = require("../../middlewares/upload")
const profileController=require("../../controllers/user/profileController")
const validate=require("../../middlewares/validate")
const editProfileValidation = require("../../validations/editProfileValidation")



//profileEdit

router.get("/profile",requireLogin,checkUserBlocked,nocache,setPagetitle("profile","profile.css"),profileController.loadProfile)
router.get("/editProfile",requireLogin,nocache,setPagetitle("editProfile","editProfile.css"),profileController.loadEditProfile)
router.post("/editProfile",requireLogin,upload.single("profileImage"),validate(editProfileValidation),setPagetitle("editProfile","editProfile.css"),profileController.editProfile)

//email change
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


module.exports=router

