import * as yup from 'yup';

export const authenticateOtpSchema = yup.object().shape({
  'otp-0': yup.string().required(),
  'otp-1': yup.string().required(),
  'otp-2': yup.string().required(),
  'otp-3': yup.string().required(),
  'otp-4': yup.string().required(),
  'otp-5': yup.string().required(),
});
