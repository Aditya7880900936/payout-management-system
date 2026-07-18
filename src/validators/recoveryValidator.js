const Joi = require("joi");

module.exports = Joi.object({
  withdrawalId: Joi.string().uuid().required(),

  status: Joi.string()
    .valid("failed", "cancelled", "rejected")
    .required(),
});