const express=require("express")
const router =express.Router()
const {requireLogin}=require("../../middlewares/userAuth")
const validate=require("../../middlewares/validate")
const couponController =require("../../controllers/user/couponController")
const {couponApplyValidationSchema}=require("../../validations/couponValidation") 

router.post("/coupon/apply-coupon",requireLogin,validate(couponApplyValidationSchema),couponController.applyCoupon)

router.post("/coupon/remove-coupon",requireLogin,couponController.removeCoupon)
router.get("/coupon/available-coupons",requireLogin,couponController.getAvailableCoupons)

router.post( '/validate-coupon',requireLogin,validate(couponApplyValidationSchema),couponController.validateCoupon)









module.exports=router