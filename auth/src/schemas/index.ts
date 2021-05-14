import Joi from 'joi';

export * from './LoginSchema';
export * from './SignupSchema';
export * from './WithdrawalSchema';

export const validationOptions: Joi.ValidationOptions = {
  abortEarly: false,
  stripUnknown: true,
};
