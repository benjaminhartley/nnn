import Joi from 'joi';

export const LoginSchema = Joi.object({
  name: Joi.string().required(),
  password: Joi.string().required(),
});
