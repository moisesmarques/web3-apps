import { VALIDATE_TOKEN } from '@/constants/api';

import { postRequest } from '../utils';

export interface ISignupServiceProps {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
}
export const validateToken = async (
  token: string
): Promise<{
  token: string;
}> => {
  try {
    const resp = await postRequest(VALIDATE_TOKEN, { token: token });
    return { token: resp.data.token };
  } catch (err) {
    throw new Error('signup API call Failed');
  }
};
