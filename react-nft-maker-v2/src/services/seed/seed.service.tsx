import { API_SEED_PHRASE } from '@/constants/api';
import { getErrorMessage } from '@/utils/helper';

import { postRequest } from '../utils';

export const requestSeedPhrase = async (walletName: string | undefined): Promise<any> => {
  try {
    const { data } = await postRequest(`${API_SEED_PHRASE}`, { walletName });
    return data?.data || [];
  } catch (err: any) {
    throw new Error(getErrorMessage(err));
  }
};
