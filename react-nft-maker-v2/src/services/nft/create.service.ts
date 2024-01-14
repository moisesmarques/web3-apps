import { API_NFT, API_NFT_AD_CONVERSION } from '@/constants/api';
import { getErrorMessage } from '@/utils/helper';

import { postRequest, postRequestExternal } from '../utils';

export interface Attribute {
  attr_name: string;
  attr_value: string;
}

export interface CreateNFTData {
  title: string;
  description: string;
  collectionId?: string;
  filePath?: string;
  categoryId?: string;
  tags?: string[];
}

type ICreateNftServiceProps = {
  body: CreateNFTData;
  token: string;
  walletId: string;
};

export interface IConversionData {
  transaction_id: string;
  userWallet: string;
  categoryId: string;
  description: string;
  title: string;
}

const transformCreateNftResponse = (response: any) => ({
  ...response,
  data: {
    title: response.data.title,
    category: response.data.categoryId,
    description: response.data.description,
    fileUrl: response.data.filePath,
    nftId: response.data.nftId,
    transactionId: response.data.transactionId,
    ownerWalletId: response.data.ownerWalletId,
    categoryId: response.data.categoryId,
  },
});

export const createNftService = async ({ body, token }: ICreateNftServiceProps): Promise<any> => {
  try {
    const resp = await postRequest(`${API_NFT}`, body, {
      headers: {
        Authorization: token,
      },
    });

    return transformCreateNftResponse(resp.data);
  } catch (e: any) {
    throw new Error(getErrorMessage(e));
  }
};

export const nftAdConversionService = async (body: IConversionData): Promise<any> => {
  try {
    const conversionPayload = {
      ['transaction_id']: body.transaction_id,
      userWallet: body.userWallet,
      details: {
        categoryId: body.categoryId,
        description: body.description,
        title: body.title,
      },
    };
    const resp = await postRequestExternal(`${API_NFT_AD_CONVERSION}`, conversionPayload);

    return resp.data;
  } catch (e: any) {
    throw new Error(getErrorMessage(e));
  }
};
