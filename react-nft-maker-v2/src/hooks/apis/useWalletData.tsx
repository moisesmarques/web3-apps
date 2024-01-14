import { useQuery } from 'react-query';

import { getWalletData } from '@/services/wallet/wallet.service';
import { getAuthDataSelector } from '@/store/auth';

import { useAppSelector } from '../useReduxTypedHooks';

/**
 * Hook for querying wallet data
 * @returns data for wallet
 */
export function useWalletData() {
  const {
    user: { userId },
  } = useAppSelector(getAuthDataSelector);
  return useQuery(['walletData', userId], () => getWalletData(userId), { retry: false });
}
