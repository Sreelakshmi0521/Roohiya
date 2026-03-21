const validate = (schema) => {
    
  return (req, res, next) => {

const { value, error } = schema.validate(req.body, {
  abortEarly: false,
  stripUnknown: true
});


    if (error) {
      const errors = {};
      error.details.forEach((err) => {
        const key = err.path.join('.');
        errors[key] = err.message.replace(/["]/g, '');
      });

      if (req.xhr ||  req.headers.accept?.includes("json")) {
        return res.status(400).json({ errors });
      }

      return res.status(400).render("error", {
        message: "Validation failed. Please correct the errors.",
        messageType: "error",
        pageTitle: "Validation Error",
        pagecss: "common.css",
      });
    }

req.body = value;

  next();
  };
};

module.exports = validate;
