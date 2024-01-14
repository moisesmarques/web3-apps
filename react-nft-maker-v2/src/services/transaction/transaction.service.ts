import { API_TRANSACTION_DATA } from '@/constants/api';

import { getRequest } from '../utils';

export const getTransactionsData = async (walletId: any): Promise<any> => {
  const { data } = await getRequest(`${API_TRANSACTION_DATA(walletId)}`);
  return data?.data || [];
};
