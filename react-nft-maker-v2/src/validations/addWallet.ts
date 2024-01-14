import * as yup from 'yup';

export const addWalletValidation = yup.object().shape({
  walletName: yup.string().required(),
  email: yup.string().required(),
  phone: yup.string().min(9).required('Phone is Required'),
});
