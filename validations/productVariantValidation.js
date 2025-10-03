const joi=require("joi")
const productVariantValidation=joi.object({
    product:joi.string()
    .required()
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
     discountedPrice:joi.number()
    .min(0)
    .max(joi.ref("price"))
    .messages({
      "number.max": "Discounted price cannot be more than the price"

    }),
       isListed: joi.boolean()


})
module.exports= productVariantValidation