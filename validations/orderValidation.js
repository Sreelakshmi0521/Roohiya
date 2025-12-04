// validations/orderValidation.js
const Joi = require('joi');

const returnOrderSchema = Joi.object({
    orderId: Joi.string()
        .required()
        .regex(/^[0-9a-fA-F]{24}$/)
        .message('Invalid order ID format'),
    reason: Joi.string()
        .required()
        .min(10)
        .max(1000)
        .trim()
        .messages({
            'string.empty': 'Return reason is required',
            'string.min': 'Return reason must be at least 10 characters',
            'string.max': 'Return reason cannot exceed 1000 characters'
        })
});

const returnOrderItemSchema = Joi.object({
    orderId: Joi.string()
        .required()
        .regex(/^[0-9a-fA-F]{24}$/)
        .message('Invalid order ID format'),
    productIndex: Joi.number()
        .required()
        .integer()
        .min(0)
        .message('Invalid product index'),
    reason: Joi.string()
        .required()
        .min(10)
        .max(1000)
        .trim()
        .messages({
            'string.empty': 'Return reason is required',
            'string.min': 'Return reason must be at least 10 characters',
            'string.max': 'Return reason cannot exceed 1000 characters'
        })
});

module.exports = {
    returnOrderSchema,
    returnOrderItemSchema
};