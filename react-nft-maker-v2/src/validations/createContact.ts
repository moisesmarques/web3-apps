import * as yup from 'yup';

const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
const nameRegex = /^[a-z A-Z]+(-[a-z A-Z]+)?$/;
const phoneMessage = 'Phone number is not valid';
const emailOrPhoneMessage = 'Email or Phone is required';

export const createContactValidation = yup.object().shape(
  {
    firstName: yup.string().trim().matches(nameRegex).required(),
    lastName: yup.string().trim().matches(nameRegex),
    email: yup
      .string()
      .trim()
      .email()
      .when('phone', {
        is: (phone: string) => !phone || phone.length === 0,
        then: yup.string().trim().email().required(emailOrPhoneMessage),
        otherwise: yup.string(),
      }),
    phone: yup
      .string()
      .trim()
      .matches(phoneRegex, phoneMessage)
      .when('email', {
        is: (email: string) => !email || email.length === 0,
        then: yup.string().trim().matches(phoneRegex, phoneMessage).required(emailOrPhoneMessage),
        otherwise: yup.string(),
      }),
  },
  [['email', 'phone']]
);
