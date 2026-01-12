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

// Apply checkSession to all routes
router.use(checkSession);

// GET /admin/coupons - Render coupon management page
router.get('/coupons',setPagetitle("COUPONS","coupons.css"), couponController.getAllCoupons);

// API Routes for AJAX operations
router.post('/coupons', validate(couponValidationSchema) ,couponController.createCoupon); // CREATE
router.get('/coupons/:id', couponController.getCouponById); // READ single
router.put('/coupons/:id', validate(couponUpdateValidationSchema), couponController.updateCoupon); // UPDATE
router.patch('/coupons/:id/toggle-status', couponController.toggleCouponStatus); // Toggle status
router.delete('/coupons/:id', couponController.deleteCoupon); // DELETE

module.exports = router;