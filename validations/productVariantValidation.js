const joi = require("joi");

const addVariantValidation = joi.object({
  product: joi.string().optional().allow(null, "").messages({
    "string.empty": "Product id cannot be empty"
  }),
  color: joi.string().trim().lowercase().required().messages({
    "any.required": "Color is required",
    "string.empty": "Color cannot be empty"
  }),
  stock: joi.number().integer().min(0).required().messages({
    "any.required": "Stock is required",
    "number.base": "Stock must be a number",
    "number.min": "Stock cannot be negative"
  }),
  images: joi.array()
    .items(joi.string().required())
    .length(3)   
     .optional() 
    .messages({
      "array.length": "You must upload exactly 3 images",
      "any.required": "Images are required"
    }),
  price: joi.number().min(0).required().messages({
    "any.required": "Price is required",
    "number.min": "Price cannot be negative"
  }),
  discountedPrice: joi.number()
    .min(0)
    .less(joi.ref("price"))
    .optional()
    .allow(null)
    .messages({
      "number.min": "Discounted price cannot be negative",
      "number.less": "Discounted price must be less than the original price"
    }),
  isListed: joi.boolean().optional()
})


const editVariantValidation = joi.object({
  product: joi.string().optional(),
  color: joi.string().trim().lowercase().required().messages({
    "any.required": "Color is required",
    "string.empty": "Color cannot be empty"
  }),
  stock: joi.number().integer().min(0).required().messages({
    "any.required": "Stock is required",
    "number.base": "Stock must be a number",
    "number.min": "Stock cannot be negative"
  }),
  images: joi.array()
    .items(joi.string().required())
    .length(3) 
    .optional()
    .messages({
      "array.length": "If uploading images, exactly 3 are required"
    }),
  price: joi.number().min(0).required().messages({
    "any.required": "Price is required",
    "number.min": "Price cannot be negative"
  }),
  discountedPrice: joi.number()
    .min(0)
    .less(joi.ref("price"))
    .optional()
    .allow(null)
    .messages({
      "number.min": "Discounted price cannot be negative",
      "number.less": "Discounted price must be less than the original price"
    }),
  isListed: joi.boolean().optional()
});




module.exports ={addVariantValidation, editVariantValidation} ;
