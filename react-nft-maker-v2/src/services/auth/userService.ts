import { API_USER } from '@/constants/api';
import { User } from '@/store/auth/types';
import { getErrorMessage } from '@/utils/helper';

import { putRequest } from '../utils';

export const updateUser = async ({
  userId,
  userData,
}: {
  userId: string;
  userData: Partial<User>;
}): Promise<{
  response: { message: string };
}> => {
  try {
    const resp = await putRequest(`${API_USER}/${userId}`, userData);
    return { response: resp.data };
  } catch (err: any) {
    throw new Error(getErrorMessage(err));
  }
};
