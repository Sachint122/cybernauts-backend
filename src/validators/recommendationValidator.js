const Joi = require('joi');

const feedback = Joi.object({
  targetId: Joi.string().hex().length(24).required(),
  targetType: Joi.string().valid('USER', 'HOBBY').required(),
  action: Joi.string().valid('ACCEPT', 'REJECT', 'DISMISS').required(),
});

module.exports = {
  feedback,
};
