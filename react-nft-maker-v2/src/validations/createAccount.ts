import * as yup from 'yup';

export const createAccountValidation = yup.object().shape({
  fullName: yup.string().max(50).required(),
  accountId: yup.string().required(),
});
