import { Wallet } from '@/store/auth/types';

import { getRequest } from '../utils';
import { API_WALLETS } from './../../constants/api';

type WalletResponse = {
  isPrimary: boolean;
  pubKey: string;
  walletName: string;
  updated: number;
  userId: string;
  walletIconUrl: string;
  status: string;
  created: number;
  walletId: string;
  blockchainHash: string;
  email: string;
  phone: string;
  fullName: string;
};

export const getWalletData = async (userId: string | undefined): Promise<Wallet[]> => {
  const response = await getRequest(`${API_WALLETS}?userId=${userId}`);

  return transformWalletData(response.data.wallets);
};

const transformWalletData = (walletData: WalletResponse[]): Wallet[] => {
  return walletData.map((wallet: WalletResponse) => {
    return {
      email: wallet.email,
      phone: wallet.phone,
      fullName: wallet.fullName,
      walletId: wallet.walletName,
    };
  });
};
