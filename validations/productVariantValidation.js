const joi=require("joi")
const productVariantValidation=joi.object({
    product:joi.string()
    .optional()
    .messages({
    "any.required": "Product id is required",
    "string.empty": "Product id cannot be empty"
    }),
    color:joi.string()
    .trim()
    .lowercase()
    .required()
    .messages({
    "any.required": "Color is required",
    "string.empty": "Color cannot be empty"
    }),
    stock:joi.number()
    .integer()
    .min(0)
    .required()
    .messages({
    "any.required": "Stock is required",
    "number.base": "Stock must be a number",
    "number.min": "Stock cannot be negative"
    }),
    images:joi.array()
    .items(joi.string().required())
    .min(3)
    .required()
    .messages({
       "array.min": "At least 3 images are required",
      "any.required": "Images are required"
    }),
     price:joi.number()
    .min(0)
    .required()
    .messages({
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
       isListed: joi.boolean()


})
module.exports= productVariantValidation