import { VERIFY_JWT } from '@/constants/api';
import { VerificationJWTRequest, VerificationJWTResponse } from '@/store/auth/types';
import { getErrorMessage } from '@/utils/helper';

import { postRequestWithToken } from '../utils';

export const verifyJWTService = async ({
  token,
}: VerificationJWTRequest): Promise<{
  response: VerificationJWTResponse;
}> => {
  try {
    const resp = await postRequestWithToken(VERIFY_JWT, token);
    return { response: { ...resp.data.data, token: token } };
  } catch (err: any) {
    throw new Error(getErrorMessage(err));
  }
};
