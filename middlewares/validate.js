const validate = (schema) => {
    
  return (req, res, next) => {

    const { error } = schema.validate(req.body, { abortEarly: false });

    if (error) {
      const errors = {};
      error.details.forEach((err) => {
        const key = err.path[0];
        errors[key] = err.message.replace(/["]/g, '');
      });

      if (req.xhr || req.headers.accept.includes("json")) {
        return res.status(400).json({ errors });
      }

      return res.status(400).render("error", {
        message: "Validation failed. Please correct the errors.",
        messageType: "error",
        pageTitle: "Validation Error",
        pagecss: "common.css",
      });
    }

  return  next();
  };
};

module.exports = validate;
