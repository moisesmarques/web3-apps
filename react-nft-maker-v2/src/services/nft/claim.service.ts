import { AxiosResponse } from 'axios';

import { API_NFT } from '@/constants/api';
import { getErrorMessage } from '@/utils/helper';

import { IClaimNftThunk } from '../../store/nft/nftSlice';
import { getRequest } from '../utils';

export const claimNftService = async ({ nftId, claimToken }: IClaimNftThunk): Promise<AxiosResponse> => {
  try {
    const resp = await getRequest(`${API_NFT}/${nftId}/claim/${claimToken}`);
    return resp;
  } catch (e: any) {
    throw new Error(getErrorMessage(e));
  }
};
