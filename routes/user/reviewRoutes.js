const express=require("express")
const router =express.Router()
const {requireLogin}=require("../../middlewares/userAuth")
const reviewController=require("../../controllers/user/reviewController")




router.post("/review/add",requireLogin,reviewController.addReview)


module.exports=router