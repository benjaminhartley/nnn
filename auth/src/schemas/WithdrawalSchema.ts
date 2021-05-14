import Joi from 'joi';

export const WithdrawalSchema = Joi.object({
  withdrawalAddress: Joi.string().required(),
  rawAmount: Joi.string().required(),
});
