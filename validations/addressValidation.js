const joi = require("joi");

const addAddressValidation = joi.object({
  name: joi.string()
    .trim()
    .pattern(/^[A-Za-z\s]+$/)
    .min(3)
    .max(50)
    .required()
    .messages({
      "string.empty": "Full name is required",
      "string.pattern.base": "Name should only contain letters and spaces",
      "string.min": "Name should have at least 3 characters",
    }),

  phone: joi.string()
    .pattern(/^[6-9]\d{9}$/)
    .required()
    .messages({
      "string.empty": "Phone number is required",
      "string.pattern.base": "Phone number must be 10 digits and start with 6-9",
    }),

  houseName: joi.string()
    .trim()
    .min(2)
    .required()
    .messages({
      "string.empty": "House/Building name is required",
    }),

  locality: joi.string()
    .trim()
    .required()
    .messages({
      "string.empty": "Locality is required",
    }),

  pincode: joi.string()
    .pattern(/^[1-9][0-9]{5}$/)
    .required()
    .messages({
      "string.empty": "Pincode is required",
      "string.pattern.base": "Invalid pincode format",
    }),

  city: joi.string()
    .trim()
    .pattern(/^[A-Za-z\s]+$/)
    .required()
    .messages({
      "string.empty": "City is required",
      "string.pattern.base": "City name should only contain letters",
    }),

  state: joi.string()
    .trim()
    .pattern(/^[A-Za-z\s]+$/)
    .required()
    .messages({
      "string.empty": "State is required",
      "string.pattern.base": "State name should only contain letters",
    }),

  country: joi.string()
    .trim()
    .valid("India")
    .required()
    .messages({
      "any.only": "Country must be India",
      "string.empty": "Country is required",
    }),

  landmark: joi.string().trim().allow(""),

  addressType: joi.string()
    .valid("Home", "Work", "Other")
    .default("Home"),

  isDefault: joi.boolean().default(false),
});


// EDIT VALIDATION
const editAddressValidation = joi.object({
  name: joi.string()
    .trim()
    .pattern(/^[A-Za-z\s]+$/)
    .min(3)
    .max(50)
    .optional()
    .messages({
      "string.pattern.base": "Name should only contain letters and spaces",
    }),

  phone: joi.string()
    .pattern(/^[6-9]\d{9}$/)
    .optional()
    .messages({
      "string.pattern.base": "Phone number must be 10 digits and start with 6-9",
    }),

  houseName: joi.string().trim().min(2).optional(),

  locality: joi.string().trim().optional(),

  pincode: joi.string()
    .pattern(/^[1-9][0-9]{5}$/)
    .optional()
    .messages({
      "string.pattern.base": "Invalid pincode format",
    }),

  city: joi.string()
    .trim()
    .pattern(/^[A-Za-z\s]+$/)
    .optional()
    .messages({
      "string.pattern.base": "City name should only contain letters",
    }),

  state: joi.string()
    .trim()
    .pattern(/^[A-Za-z\s]+$/)
    .optional()
    .messages({
      "string.pattern.base": "State name should only contain letters",
    }),

  country: joi.string()
    .trim()
    .valid("India")
    .optional(),

  landmark: joi.string().trim().allow("").optional(),

  addressType: joi.string().valid("Home", "Work", "Other").optional(),

  isDefault: joi.boolean().optional(),
});

module.exports = {
  addAddressValidation,
  editAddressValidation,
};
