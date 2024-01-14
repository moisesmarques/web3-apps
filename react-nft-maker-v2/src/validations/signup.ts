import * as yup from 'yup';

export const signupValidation = (type: string) => {
  if (type === 'email') {
    return yup.object().shape({
      email: yup.string().required('Email is Required').email('Email is Invalid'),
    });
  }
  if (type === 'countryCode') {
    return yup.object().shape({
      email: yup.string().min(2).max(4).required('Country Code is Required'),
    });
  }
  return yup.object().shape({
    phone: yup.string().min(10).required('Phone is Required'),
  });
};
