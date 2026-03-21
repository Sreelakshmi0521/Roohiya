const express = require("express");
const router = express.Router();
const couponController = require("../../controllers/admin/couponController");
const { checkSession } = require("../../middlewares/adminAuth");
const validate = require("../../middlewares/validate");
const { 
    couponValidationSchema, 
    couponUpdateValidationSchema 
} = require('../../validations/couponValidation');
const setPagetitle = require("../../middlewares/setpagetitle")

router.use(checkSession);

router.get('/coupons',setPagetitle("COUPONS","coupons.css"), couponController.getAllCoupons);

router.post('/coupons', validate(couponValidationSchema) ,couponController.createCoupon);
router.get('/coupons/:id', couponController.getCouponById);
router.put('/coupons/:id', validate(couponUpdateValidationSchema), couponController.updateCoupon); 
router.patch('/coupons/:id/toggle-status', couponController.toggleCouponStatus); 
router.delete('/coupons/:id', couponController.deleteCoupon);

module.exports = router;