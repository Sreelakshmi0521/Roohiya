const joi=require("joi")

const editProfileValidation=joi.object({
   name:joi.string()
   .pattern(/^[A-Za-z\s]+$/) 
   .min(3)
   .max(50)
   .required()
   .messages({
        "string.empty": "Name cannot be empty",
         "string.min": "Name should have at least 3 characters",
              "string.pattern.base": "Name can only contain alphabets and spaces",
      "any.required": "Name is required",

   }),
   email: joi.string()
    .email()
    .required()
    .messages({
      "string.empty": "Email cannot be empty",
      "string.email": "Invalid email address",
      "any.required": "Email is required",
    }),
     phone: joi.string()
    .pattern(/^[0-9]{10}$/) 
    .required()
    .messages({
      "string.empty": "Phone number cannot be empty",
      "string.pattern.base": "Phone must be exactly 10 digits and contain only numbers",
      "any.required": "Phone number is required",
    }),


})


module.exports=editProfileValidation