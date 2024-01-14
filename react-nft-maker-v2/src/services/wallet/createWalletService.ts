import { ACCOUNT_ID_PREFIX, API_WALLETS } from '@/constants/api';
import { ICreateWalletServiceRequestProps, ICreateWalletServiceResponse } from '@/store/wallet/types';
import { getErrorMessage } from '@/utils/helper';

import { postRequest } from '../utils';

export const createWalletService = async ({
  walletName,
  userId,
  email,
  phone,
}: ICreateWalletServiceRequestProps): Promise<{
  response: ICreateWalletServiceResponse;
}> => {
  const data = {
    walletName: `${walletName + ACCOUNT_ID_PREFIX}`,
    email,
    phone,
    userId,
  };

  try {
    const resp = await postRequest(API_WALLETS, data);
    return { response: resp.data };
  } catch (err: any) {
    throw new Error(getErrorMessage(err));
  }
};
