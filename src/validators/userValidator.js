const Joi = require('joi');

const updateUser = Joi.object({
  name: Joi.string().min(2).max(50),
  email: Joi.string().email(),
  hobbies: Joi.array().items(Joi.string()),
});

module.exports = {
  updateUser,
};
