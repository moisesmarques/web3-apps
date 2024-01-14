import { AxiosResponse } from 'axios';

import { SEND_NFT_API } from '@/constants/api';
import { getErrorMessage } from '@/utils/helper';

import { postRequest } from '../utils';

type ISendNftService = {
  nftId: string;
  body: {
    recipientId: string;
  };
};

export const sendNftService = async ({ nftId, body }: ISendNftService): Promise<AxiosResponse> => {
  try {
    return await postRequest(SEND_NFT_API(nftId), body);
  } catch (e: any) {
    throw new Error(getErrorMessage(e));
  }
};
