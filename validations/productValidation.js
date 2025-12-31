
const joi=require("joi")

const addProductValidation=joi.object({
    name:joi.string()
    .trim()
    .required()
    .messages({
        "any.required": "Product name is required",
        "string.empty": "Product name cannot be empty"
    }),
    category:joi.string()
    .required()
    .messages({
    "any.required": "Category is required",
    "string.empty": "Category cannot be empty"
    }),
    description:joi.string()
    .trim()
    .max(1000)
    .required()
    .messages({
    "any.required": "Description is required",
    "string.empty": "Description cannot be empty",
    "string.max": "Description cannot exceed 1000 characters"
    }),
    highlights:joi.array()
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
    color: joi.string().trim().required().messages({
          "any.required": "Color is required for each variant.",
          "string.empty": "Color cannot be empty."
        }),
    stock: joi.number().min(0).required() .messages({
          "any.required": "Stock is required.",
          "number.base": "Stock must be a number.",
          "number.min": "Stock cannot be negative."
        }),
   price: joi.number().min(0.01).required().messages({
                "any.required": "Price is required",
                "number.min": "Price must be greater than 0"
            }),
            discountedPrice: joi.number()
                .min(0)
                .less(joi.ref('price')) // < original price
                .optional()
                .allow(null, '')
                .messages({
                    "number.base": "Discounted price must be a valid number",
                    "number.less": "Discounted price must be less than original price",
                    "number.min": "Discounted price cannot be negative"
                }),
})).min(1).required().messages({
      "array.min": "At least one product variant is required."
    }),

      isListed: joi.boolean()

})

const updateProductValidation = joi.object({
    name:joi.string().trim().required().messages({
        "any.required": "Product name is required",
        "string.empty": "Product name cannot be empty"
    }),
    category:joi.string().required().messages({
        "any.required": "Category is required",
        "string.empty": "Category cannot be empty"
    }),
    description: joi.string().trim().max(1000).required().messages({
        "any.required": "Description is required",
        "string.empty": "Description cannot be empty",
        "string.max": "Description cannot exceed 1000 characters"
    }),
    highlights: joi.array().items(
        joi.string().trim().max(100).messages({
            "string.max": "Each highlight cannot exceed 100 characters"
        })
    ).optional(),
    variants: joi.array().items(joi.object({
        color: joi.string().trim().required().messages({
            "any.required": "Color is required for each variant.",
            "string.empty": "Color cannot be empty."
        }),
        stock: joi.number().min(0).required().messages({
            "any.required": "Stock is required.",
            "number.base": "Stock must be a number.",
            "number.min": "Stock cannot be negative."
        }),
        price: joi.number().min(0).required().messages({
            "any.required": "Price is required.",
            "number.base": "Price must be a number.",
            "number.min": "Price cannot be negative."
        }),
        discountedPrice: joi.number().min(0).optional().allow(null).messages({
            "number.base": "Discounted price must be a number.",
            "number.min": "Discounted price cannot be negative."
        })
    })).optional(),
    isListed: joi.boolean()
});


  module.exports={addProductValidation,updateProductValidation}