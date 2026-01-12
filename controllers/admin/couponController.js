const Coupon = require('../../models/couponModel');

/**
 * Get all coupons with pagination and filtering
 */
const getAllCoupons = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || '';
        const status = req.query.status || 'all';

        const skip = (page - 1) * limit;

        // Build filter object
        const filter = {};

        // Search filter
        if (search) {
            filter.$or = [
                { code: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        // Status filter
        if (status === 'active') {
            filter.isActive = true;
            filter.endDate = { $gte: new Date() };
        } else if (status === 'inactive') {
            filter.isActive = false;
        } else if (status === 'expired') {
            filter.endDate = { $lt: new Date() };
        }

        // Get coupons with pagination
        const coupons = await Coupon.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        // Get total count for pagination
        const totalCoupons = await Coupon.countDocuments(filter);
        const totalPages = Math.ceil(totalCoupons / limit);

        res.render('admin/coupons', {
            coupons,
            currentPage: page,
            totalPages,
            totalCoupons,
            search,
            status,
            limit,
            pageJs:"couponAction.js",

        });

    } catch (error) {
        console.error('Error fetching coupons:', error);
        res.status(500).render('error', { 
            message: 'Error loading coupons' 
        });
    }
};

/**
 * Create a new coupon
 */
const createCoupon = async (req, res) => {
    try {
        // Data is validated by middleware
        const {
            code,
            description,
            discountType,
            discountValue,
            maxDiscountAmount,
            minPurchaseAmount,
            usageLimit,
            perUserLimit,
            startDate,
            endDate,
            isActive
        } = req.body;

        // Check if coupon code already exists
        const existingCoupon = await Coupon.findOne({ 
            code: code.toUpperCase() 
        });

        if (existingCoupon) {
            return res.status(400).json({
                success: false,
                message: 'Coupon code already exists'
            });
        }

        // Create new coupon
        const coupon = new Coupon({
            code: code.toUpperCase(),
            description,
            discountType,
            discountValue: parseFloat(discountValue),
            maxDiscountAmount: maxDiscountAmount ? parseFloat(maxDiscountAmount) : null,
            minPurchaseAmount: parseFloat(minPurchaseAmount) || 0,
            usageLimit: parseInt(usageLimit),
            usageCount: 0,
            perUserLimit: parseInt(perUserLimit),
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            isActive: isActive !== undefined ? isActive : true,
            usedBy: []
        });

        await coupon.save();

        // Return success with coupon data
        res.status(201).json({
            success: true,
            message: 'Coupon created successfully',
            coupon: {
                _id: coupon._id,
                code: coupon.code,
                description: coupon.description,
                discountType: coupon.discountType,
                discountValue: coupon.discountValue,
                maxDiscountAmount: coupon.maxDiscountAmount,
                minPurchaseAmount: coupon.minPurchaseAmount,
                usageLimit: coupon.usageLimit,
                usageCount: coupon.usageCount,
                perUserLimit: coupon.perUserLimit,
                startDate: coupon.startDate,
                endDate: coupon.endDate,
                isActive: coupon.isActive
            }
        });

    } catch (error) {
        console.error('Error creating coupon:', error);
        
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Coupon code already exists'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error creating coupon'
        });
    }
};

/**
 * Get coupon by ID for editing
 */
const getCouponById = async (req, res) => {
    try {
        const coupon = await Coupon.findById(req.params.id);
        
        if (!coupon) {
            return res.status(404).json({
                success: false,
                message: 'Coupon not found'
            });
        }

        res.json({
            success: true,
            coupon: {
                _id: coupon._id,
                code: coupon.code,
                description: coupon.description,
                discountType: coupon.discountType,
                discountValue: coupon.discountValue,
                maxDiscountAmount: coupon.maxDiscountAmount,
                minPurchaseAmount: coupon.minPurchaseAmount,
                usageLimit: coupon.usageLimit,
                usageCount: coupon.usageCount,
                perUserLimit: coupon.perUserLimit,
                startDate: coupon.startDate.toISOString().split('T')[0],
                endDate: coupon.endDate.toISOString().split('T')[0],
                isActive: coupon.isActive
            }
        });

    } catch (error) {
        console.error('Error fetching coupon:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching coupon details'
        });
    }
};

/**
 * Update coupon
 */
const updateCoupon = async (req, res) => {
    try {
        // Check if coupon exists
        const coupon = await Coupon.findById(req.params.id);
        if (!coupon) {
            return res.status(404).json({
                success: false,
                message: 'Coupon not found'
            });
        }

        // Check if code is being changed and if new code already exists
        if (req.body.code && req.body.code.toUpperCase() !== coupon.code) {
            const existingCoupon = await Coupon.findOne({ 
                code: req.body.code.toUpperCase(),
                _id: { $ne: req.params.id }
            });

            if (existingCoupon) {
                return res.status(400).json({
                    success: false,
                    message: 'Coupon code already exists'
                });
            }
        }

        // Prepare update data
        const updateData = {
            description: req.body.description,
            discountType: req.body.discountType,
            discountValue: parseFloat(req.body.discountValue),
            maxDiscountAmount: req.body.maxDiscountAmount ? parseFloat(req.body.maxDiscountAmount) : null,
            minPurchaseAmount: parseFloat(req.body.minPurchaseAmount) || 0,
            usageLimit: parseInt(req.body.usageLimit),
            perUserLimit: parseInt(req.body.perUserLimit),
            startDate: new Date(req.body.startDate),
            endDate: new Date(req.body.endDate),
            isActive: req.body.isActive !== undefined ? req.body.isActive : coupon.isActive
        };

        // Update code if provided
        if (req.body.code) {
            updateData.code = req.body.code.toUpperCase();
        }

        // Update coupon
        Object.assign(coupon, updateData);
        await coupon.save();

        res.json({
            success: true,
            message: 'Coupon updated successfully',
            coupon: {
                _id: coupon._id,
                code: coupon.code,
                description: coupon.description,
                discountType: coupon.discountType,
                discountValue: coupon.discountValue,
                maxDiscountAmount: coupon.maxDiscountAmount,
                minPurchaseAmount: coupon.minPurchaseAmount,
                usageLimit: coupon.usageLimit,
                usageCount: coupon.usageCount,
                perUserLimit: coupon.perUserLimit,
                startDate: coupon.startDate,
                endDate: coupon.endDate,
                isActive: coupon.isActive
            }
        });

    } catch (error) {
        console.error('Error updating coupon:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating coupon'
        });
    }
};

/**
 * Toggle coupon status
 */
const toggleCouponStatus = async (req, res) => {
    try {
        const coupon = await Coupon.findById(req.params.id);
        
        if (!coupon) {
            return res.status(404).json({
                success: false,
                message: 'Coupon not found'
            });
        }

        coupon.isActive = !coupon.isActive;
        await coupon.save();

        res.json({
            success: true,
            message: `Coupon ${coupon.isActive ? 'activated' : 'deactivated'} successfully`,
            isActive: coupon.isActive
        });

    } catch (error) {
        console.error('Error toggling coupon status:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating coupon status'
        });
    }
};

/**
 * Delete coupon
 */
const deleteCoupon = async (req, res) => {
    try {
        const coupon = await Coupon.findById(req.params.id);
        
        if (!coupon) {
            return res.status(404).json({
                success: false,
                message: 'Coupon not found'
            });
        }

        // Check if coupon has been used
        if (coupon.usageCount > 0) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete coupon that has been used'
            });
        }

        await Coupon.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: 'Coupon deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting coupon:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting coupon'
        });
    }
};

module.exports = {
    getAllCoupons,
    createCoupon,
    getCouponById,
    updateCoupon,
    toggleCouponStatus,
    deleteCoupon
};