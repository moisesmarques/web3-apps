import { useQuery } from 'react-query';

import { useAppDispatch, useAppSelector } from '@/hooks/useReduxTypedHooks';
import { getFileNftListDataService, getNftListDataService } from '@/services/nft/list.service';
import { getAuthUserSelector, getToken } from '@/store/auth/authSelector';
import { setAllNfts } from '@/store/nft';
import { allNftSelector } from '@/store/nft/nftSelector';

/**
 * Hook for querying NFT list data
 * @returns data for NFT List page
 */
export function useNftListData() {
  const dispatch = useAppDispatch();
  const { userId } = useAppSelector(getAuthUserSelector);
  const token: any = useAppSelector(getToken);

  return useQuery(['nftListData', userId], () => getNftListDataService(token), {
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: Infinity,
    onSuccess(data) {
      dispatch(setAllNfts(data));
    },
  });
}

export function useFileNftListData() {
  const dispatch = useAppDispatch();
  const {
    user: { walletName },
    data,
  } = useAppSelector((state) => ({
    user: getAuthUserSelector(state),
    data: allNftSelector(state),
  }));

  const token: any = useAppSelector(getToken);

  if (data && data.length) {
    return {
      data,
      isLoading: false,
    };
  }

  return useQuery(['nftFileListData', walletName], () => getFileNftListDataService(walletName, token), {
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: Infinity,
    onSuccess(data) {
      dispatch(setAllNfts(data));
    },
  });
}
