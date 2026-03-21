const Joi = require('joi');

const couponValidationSchema = Joi.object({
    code: Joi.string()
        .trim()
        .uppercase()
        .min(4)
        .max(20)
        .pattern(/^[A-Z][A-Z0-9_-]{3,19}$/)
        .required()
        .messages({
            'string.empty': 'Coupon code is required',
            'string.min': 'Coupon code must be at least 4 characters',
            'string.max': 'Coupon code cannot exceed 20 characters',
            'string.pattern.base': 'Coupon code must start with a letter (A-Z) and can contain letters, numbers, underscore (_), or hyphen (-)'
        }),

    description: Joi.string()
        .trim()
        .max(200)
        .required()
        .messages({
            'string.empty': 'Description is required',
            'string.max': 'Description cannot exceed 200 characters'
        }),

    discountType: Joi.string()
        .valid('percentage', 'fixed')
        .required()
        .messages({
            'any.only': 'Discount type must be either "percentage" or "fixed"'
        }),

    discountValue: Joi.number()
        .min(0.01)
        .when('discountType', {
            is: 'percentage',
            then: Joi.number().max(100).messages({
                'number.max': 'Percentage discount cannot exceed 100%'
            }),
            otherwise: Joi.number().min(1).messages({
                'number.min': 'Fixed discount must be at least ₹1'
            })
        })
        .required()
        .messages({
            'number.base': 'Discount value must be a number',
            'number.min': 'Discount value must be greater than 0'
        }),

    maxDiscountAmount: Joi.number()
        .min(0)
        .allow(null)
        .optional()
        .when('discountType', {
            is: 'percentage',
            then: Joi.number().greater(0).messages({
                'number.greater': 'Max discount amount must be greater than 0'
            })
        })
        .messages({
            'number.base': 'Max discount amount must be a number'
        }),

    minPurchaseAmount: Joi.number()
        .min(0)
        .default(0)
        .messages({
            'number.base': 'Minimum purchase amount must be a number',
            'number.min': 'Minimum purchase amount cannot be negative'
        }),

    usageLimit: Joi.number()
        .integer()
        .min(1)
        .required()
        .messages({
            'number.base': 'Usage limit must be a number',
            'number.min': 'Usage limit must be at least 1',
            'number.integer': 'Usage limit must be a whole number'
        }),

    perUserLimit: Joi.number()
        .integer()
        .min(1)
        .required()
        .messages({
            'number.base': 'Per user limit must be a number',
            'number.min': 'Per user limit must be at least 1',
            'number.integer': 'Per user limit must be a whole number'
        }),

    startDate: Joi.date()
        .iso()
        .required()
        .messages({
            'date.base': 'Start date is required',
            'date.format': 'Start date must be a valid date'
        }),

    endDate: Joi.date()
        .iso()
        .greater(Joi.ref('startDate'))
        .required()
        .messages({
            'date.base': 'End date is required',
            'date.greater': 'End date must be after start date',
            'date.format': 'End date must be a valid date'
        }),

    isActive: Joi.boolean()
        .default(true)
});


// ✅ UPDATE SCHEMA (safe version – only code optional)
const couponUpdateValidationSchema = couponValidationSchema.keys({
    code: Joi.string()
        .trim()
        .uppercase()
        .min(4)
        .max(20)
        .pattern(/^[A-Z0-9_-]{4,20}$/)
        .optional()
        .messages({
            'string.min': 'Coupon code must be at least 4 characters',
            'string.max': 'Coupon code cannot exceed 20 characters',
            'string.pattern.base': 'Coupon code can only contain uppercase letters, numbers, underscore (_), or hyphen (-)'
        })
});


// ✅ APPLY COUPON (no change)
const couponApplyValidationSchema = Joi.object({
    couponCode: Joi.string()
        .trim()
        .min(1)
        .max(20)
        .required()
        .messages({
            'string.empty': 'Please enter a coupon code',
            'string.min': 'Coupon code is required',
            'string.max': 'Coupon code cannot exceed 20 characters'
        })
});

module.exports = {
    couponValidationSchema,
    couponUpdateValidationSchema,
    couponApplyValidationSchema
};