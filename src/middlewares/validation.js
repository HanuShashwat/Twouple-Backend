// This is a Higher-Order Function. It takes a Joi schema and returns an Express middleware function.
const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, { 
      abortEarly: false, // Return all errors, not just the first one
      stripUnknown: true // Remove any extra junk data the user tries to send
    });

    if (error) {
      // Map through errors to create a clean array of messages
      const errorMessages = error.details.map((err) => err.message);
      return res.status(400).json({ success: false, message: 'Validation Failed', errors: errorMessages });
    }

    // Replace req.body with the sanitized value
    req.body = value;
    next();
  };
};

module.exports = { validateRequest };