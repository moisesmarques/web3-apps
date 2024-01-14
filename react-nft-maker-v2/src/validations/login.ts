import * as yup from 'yup';

export const loginValidation = yup.object().shape({
  accountId: yup.string().min(3).required('AccountId is Required'),
});
