import { useQuery } from 'react-query';

import { useAppSelector } from '@/hooks/useReduxTypedHooks';
import { getTransactionsData } from '@/services/transaction/transaction.service';
import { getAuthUserSelector } from '@/store/auth/authSelector';
/**
 * Hook for querying transactions data
 * @returns data for nft dashboard
 */
export function useTransactionsData() {
  const { transactions } = useAppSelector((state) => ({
    transactions: state.transactionsDetails.allTransactions,
  }));
  const { walletName } = useAppSelector(getAuthUserSelector);

  if (transactions.length > 0) {
    return {
      data: transactions,
      isLoading: false,
    };
  }
  return useQuery(['transactionsData'], () => getTransactionsData(walletName), { retry: false });
}
