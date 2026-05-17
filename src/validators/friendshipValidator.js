const Joi = require('joi');

const link = Joi.object({
  targetId: Joi.string().hex().length(24).required(),
});

module.exports = {
  link,
};
