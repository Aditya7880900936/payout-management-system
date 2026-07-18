const Joi = require("joi");

module.exports = Joi.object({
  saleId: Joi.string().uuid().required(),

  status: Joi.string()
    .valid("approved", "rejected")
    .required(),
});