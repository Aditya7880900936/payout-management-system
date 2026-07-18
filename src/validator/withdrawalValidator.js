const Joi = require("joi");

module.exports = Joi.object({
  userId: Joi.string().uuid().required(),

  amount: Joi.number().positive().required(),
});