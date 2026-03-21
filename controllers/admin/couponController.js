const Coupon = require('../../models/couponModel');




exports.getAllCoupons = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || '';
        const status = req.query.status || 'all';

        const skip = (page - 1) * limit;

        const filter = {};

        if (search) {
            filter.$or = [
                { code: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        const now = new Date();

        if (status === 'active') {
            filter.isActive = true;
            filter.startDate = { $lte: now };
            filter.endDate = { $gte: now };
        } else if (status === 'inactive') {
            filter.isActive = false;
        } else if (status === 'expired') {
            filter.endDate = { $lt: now };
        }

        const coupons = await Coupon.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

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
            pageJs: "couponAction.js",
        });

    } catch (error) {
        console.error('Error fetching coupons:', error);
        res.status(500).render('error', {
            message: 'Error loading coupons'
        });
    }
};






exports.createCoupon = async (req, res) => {
    try {
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

        const normalizedCode = code.trim().toUpperCase();

        const existingCoupon = await Coupon.findOne({ code: normalizedCode });

        if (existingCoupon) {
            return res.status(400).json({
                success: false,
                message: 'Coupon code already exists'
            });
        }

        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);

        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);

        const coupon = new Coupon({
            code: normalizedCode,
            description,
            discountType,
            discountValue: Number(discountValue),
            maxDiscountAmount: maxDiscountAmount ? Number(maxDiscountAmount) : null,
            minPurchaseAmount: Number(minPurchaseAmount) || 0,
            usageLimit: Number(usageLimit),
            usageCount: 0,
            perUserLimit: Number(perUserLimit),
            startDate: start,
            endDate: end,
            isActive: isActive !== undefined ? isActive : true,
            usedBy: []
        });

        await coupon.save();

        res.status(201).json({
            success: true,
            message: 'Coupon created successfully',
            coupon
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





exports.getCouponById = async (req, res) => {
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
                ...coupon.toObject(),
                startDate: coupon.startDate.toISOString().split('T')[0],
                endDate: coupon.endDate.toISOString().split('T')[0]
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




exports.updateCoupon = async (req, res) => {
    try {
        const coupon = await Coupon.findById(req.params.id);

        if (!coupon) {
            return res.status(404).json({
                success: false,
                message: 'Coupon not found'
            });
        }

        if (req.body.code) {
            const newCode = req.body.code.trim().toUpperCase();

            if (newCode !== coupon.code) {
                const existingCoupon = await Coupon.findOne({
                    code: newCode,
                    _id: { $ne: req.params.id }
                });

                if (existingCoupon) {
                    return res.status(400).json({
                        success: false,
                        message: 'Coupon code already exists'
                    });
                }
            }

            coupon.code = newCode;
        }

        let start = coupon.startDate;
        let end = coupon.endDate;

        if (req.body.startDate) {
            start = new Date(req.body.startDate);
            start.setHours(0, 0, 0, 0);
        }

        if (req.body.endDate) {
            end = new Date(req.body.endDate);
            end.setHours(23, 59, 59, 999);
        }

        if (req.body.description !== undefined) coupon.description = req.body.description;
        if (req.body.discountType !== undefined) coupon.discountType = req.body.discountType;
        if (req.body.discountValue !== undefined) coupon.discountValue = Number(req.body.discountValue);
        if (req.body.maxDiscountAmount !== undefined) coupon.maxDiscountAmount = req.body.maxDiscountAmount ? Number(req.body.maxDiscountAmount) : null;
        if (req.body.minPurchaseAmount !== undefined) coupon.minPurchaseAmount = Number(req.body.minPurchaseAmount);
        if (req.body.usageLimit !== undefined) coupon.usageLimit = Number(req.body.usageLimit);
        if (req.body.perUserLimit !== undefined) coupon.perUserLimit = Number(req.body.perUserLimit);
        if (req.body.isActive !== undefined) coupon.isActive = req.body.isActive;

        coupon.startDate = start;
        coupon.endDate = end;

        await coupon.save();

        res.json({
            success: true,
            message: 'Coupon updated successfully',
            coupon
        });

    } catch (error) {
        console.error('Error updating coupon:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating coupon'
        });
    }
};






exports.toggleCouponStatus = async (req, res) => {
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







exports.deleteCoupon = async (req, res) => {
    try {
        const coupon = await Coupon.findById(req.params.id);

        if (!coupon) {
            return res.status(404).json({
                success: false,
                message: 'Coupon not found'
            });
        }

        if ((coupon.usageCount || 0) > 0) {
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