import { AxiosResponse } from 'axios';

import { GIFT_NFT_API } from '@/constants/api';
import { getErrorMessage } from '@/utils/helper';

import { postRequest } from '../utils';

type ISendNftService = {
  nftId: string;
  body: {
    contactIds: any;
  };
};

export const giftNftService = async ({ nftId, body }: ISendNftService): Promise<AxiosResponse> => {
  let i, j;
  const temporary: any = [];

  // setting max payload size
  const chunk = 1024;
  for (i = 0, j = body?.contactIds?.length; i < j; i += chunk) {
    temporary.push(body?.contactIds?.slice(i, i + chunk));
  }

  for (let x = 0; x < temporary.length - 1; x++) {
    try {
      await postRequest(GIFT_NFT_API(nftId), { contactIds: temporary[x] });
    } catch (e: any) {
      throw new Error(getErrorMessage(e));
    }
  }

  // last iteration which will also return response to component
  try {
    return await await postRequest(GIFT_NFT_API(nftId), { contactIds: temporary[temporary.length - 1] });
  } catch (e: any) {
    throw new Error(getErrorMessage(e));
  }
};
