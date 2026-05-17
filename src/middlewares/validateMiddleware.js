const ApiError = require('../utils/ApiError');

const validate = (schema) => (req, res, next) => {
  const { value, error } = schema.validate(req.body, { abortEarly: false, allowUnknown: true });
  
  if (error) {
    const errorMessage = error.details.map((details) => details.message);
    return next(new ApiError(400, 'Validation failed', errorMessage));
  }
  
  Object.assign(req, value);
  return next();
};

module.exports = validate;
