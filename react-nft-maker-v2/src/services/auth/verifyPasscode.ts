import { ACCOUNT_ID_PREFIX, VERIFY_PASSCODE } from '@/constants/api';
import { VerificationCodeAPIUserResponse } from '@/store/auth/types';
import { getErrorMessage } from '@/utils/helper';

import { postRequest } from '../utils';

export const verifyPasscode = async ({
  code,
  accountId,
}: {
  code: string;
  accountId: string;
}): Promise<{
  user: VerificationCodeAPIUserResponse;
  jwtAccessToken: string;
  jwtRefreshToken: string;
}> => {
  try {
    const {
      data: { jwtAccessToken, jwtRefreshToken, user },
    } = await postRequest(VERIFY_PASSCODE, { OTP: code, walletID: `${accountId + ACCOUNT_ID_PREFIX}` });

    return { user, jwtAccessToken, jwtRefreshToken };
  } catch (err: any) {
    throw new Error(getErrorMessage(err) || 'Passcode Verification Failed');
  }
};
