const joi = require("joi");

const addProductValidation = joi.object({
    name: joi.string()
        .trim()
        .min(2)
        .max(100)
        .required()
        // Custom rule: Must contain at least one letter
        .custom((value, helpers) => {
            // If only numbers (with optional spaces) → reject
            if (/^\s*\d+\s*$/.test(value)) {
                return helpers.message("Product name cannot be only numbers. Please include letters (e.g., Shirt123 is ok, but 12345 is not).");
            }
            // If no letters at all (only numbers + symbols) → reject
            if (!/[A-Za-z]/.test(value)) {
                return helpers.message("Product name must contain at least one letter.");
            }
            return value;
        })
        // Allowed characters
        .pattern(/^[A-Za-z0-9\s\-&.,()]+$/)
        .messages({
            "string.pattern.base": "Product name can only contain letters, numbers, spaces, and symbols: - & . , ( )",
            "any.required": "Product name is required",
            "string.empty": "Product name cannot be empty",
            "string.min": "Product name must be at least 2 characters",
            "string.max": "Product name too long (max 100 characters)"
        }),

    category: joi.string()
        .required()
        .messages({
            "any.required": "Category is required",
            "string.empty": "Category cannot be empty"
        }),

    description: joi.string()
        .trim()
        .max(1000)
        .required()
        .messages({
            "any.required": "Description is required",
            "string.empty": "Description cannot be empty",
            "string.max": "Description cannot exceed 1000 characters"
        }),

    highlights: joi.array()
        .items(
            joi.string()
                .trim()
                .max(100)
                .messages({
                    "string.max": "Each highlight cannot exceed 100 characters"
                })
        )
        .optional(),

    variants: joi.array().items(joi.object({
        color: joi.string()
            .trim()
            .required()
            .messages({
                "any.required": "Color is required for each variant",
                "string.empty": "Color cannot be empty"
            }),

        // PRICE: Must be pure number only
        price: joi.number()
            .greater(0)
            .required()
            .messages({
                "any.required": "Price is required",
                "number.base": "Price must be a valid number only (e.g., 999, not '999abc' or 'price100')",
                "number.greater": "Price must be greater than 0"
            }),

        // DISCOUNTED PRICE: Optional, but if entered → must be pure number
        discountedPrice: joi.number()
            .min(0)
            .less(joi.ref('price'))
            .optional()
            .allow(null, "")
            .messages({
                "number.base": "Discounted price must be a valid number only",
                "number.less": "Discounted price must be less than regular price",
                "number.min": "Discounted price cannot be negative"
            }),

        // STOCK: Pure number only
        stock: joi.number()
            .integer()
            .min(0)
            .required()
            .messages({
                "any.required": "Stock is required",
                "number.base": "Stock must be a valid whole number only (e.g., 50, not '50pcs')",
                "number.min": "Stock cannot be negative",
                "number.integer": "Stock must be a whole number"
            }),
    }))
    .min(1)
    .required()
    .messages({
        "array.min": "At least one product variant is required"
    }),

    isListed: joi.boolean()
});

// For update product (similar rules)
const updateProductValidation = joi.object({
    name: joi.string()
        .trim()
        .min(2)
        .max(100)
        .required()
        .custom((value, helpers) => {
            if (/^\s*\d+\s*$/.test(value)) {
                return helpers.message("Product name cannot be only numbers. Please include letters.");
            }
            if (!/[A-Za-z]/.test(value)) {
                return helpers.message("Product name must contain at least one letter.");
            }
            return value;
        })
        .pattern(/^[A-Za-z0-9\s\-&.,()]+$/)
        .messages({
            "string.pattern.base": "Product name can only contain letters, numbers, spaces, and symbols: - & . , ( )",
            "any.required": "Product name is required",
            "string.min": "Product name too short",
            "string.max": "Product name too long"
        }),

    category: joi.string().required(),
    description: joi.string().trim().max(1000).required(),
    highlights: joi.array().items(joi.string().trim().max(100)).optional(),
    // variants optional on update
    variants: joi.array().optional(),
    isListed: joi.boolean()
});

module.exports = { addProductValidation, updateProductValidation };