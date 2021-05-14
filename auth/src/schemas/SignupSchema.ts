import Joi from 'joi';

export const SignupSchema = Joi.object({
  name: Joi.string().required().min(4).max(20),
  password: Joi.string().required().min(10),
  email: Joi.string().email().optional(),
});
