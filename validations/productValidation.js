
const joi=require("joi")

const productValidation=joi.object({
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
    highlights:joi.string()
    .trim()
    .max(100)
    .allow("")
    .messages({
      "string.max": "Highlights cannot exceed 200 characters"
    }),
      isListed: joi.boolean()

})
  module.exports=productValidation