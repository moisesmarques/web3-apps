import { API_DELETE_USER, VERIFY_DELETE_PASSCODE } from '@/constants/api';
import { IDeleteUserResponse } from '@/store/auth/types';
import { getErrorMessage } from '@/utils/helper';

import { deleteRequest, postRequest } from '../utils';

export const deleteService = async ({
  userId,
  type,
  token,
}: {
  userId: string;
  type: string;
  token: string;
}): Promise<{
  response: IDeleteUserResponse;
}> => {
  const data = {
    channelType: type,
  };

  try {
    // TO DO: NEEDS TO ADJUST DELETE USER API WHEN FINAL API IS READY
    const resp = await deleteRequest(API_DELETE_USER(userId), data, token);
    return { response: resp.data };
  } catch (err: any) {
    throw new Error(getErrorMessage(err));
  }
};

export const deleteVerifyService = async ({
  otp,
}: {
  otp: string;
}): Promise<{
  response: any;
}> => {
  try {
    const data = {
      otp,
    };
    const resp = await postRequest(VERIFY_DELETE_PASSCODE, data);
    return { response: resp.data };
  } catch (err: any) {
    throw new Error(getErrorMessage(err));
  }
};
