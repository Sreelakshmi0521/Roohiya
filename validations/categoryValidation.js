const joi =require("joi")

const addCategoryValidation=joi.object({
    name:joi.string()
    .trim()
    .required()
    .messages({
        "string.empty":"Category name is required"
    }),


    description:joi.string()
    .trim()
    .max(100)
    .required()
    .messages({
        "string.empty": "Description is required",
        "string.max":"Description cannot more than 100"
    }),

    isListed:joi.boolean().default(true),
   

})
const editCategoryValidation=joi.object({
    name:joi.string()
    .trim()
    .required()
    .messages({
        "string.empty": "Category name is required"
    }),

    description:joi.string()
    .trim()
    .max(100)
    .required()
    .messages({
      "string.empty": "Description is required",
       "string.max": "Description cannot be more than 100 characters"

    })
})

module.exports={addCategoryValidation,editCategoryValidation}