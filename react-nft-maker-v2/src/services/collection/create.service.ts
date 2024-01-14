import { API_NFT_COLLECTIONS } from '@/constants/api';

import { postRequest } from '../utils';

export interface NftCollection {
  collectionId: string;
  collectionName: string;
  ownerId: string;
  status: string;
  created: number;
  updated: number;
}
export interface CreateNFTCollectionDataResponse {
  message: string;
  data: NftCollection;
}

export interface ICreateNftCollectionBody {
  collectionName: string;
  ownerId: string;
  status: 'active' | 'pending';
}

export interface ICreateNftCollection {
  body: ICreateNftCollectionBody;
  token: string;
}

export const createNftCollectionService = async ({ body, token }: ICreateNftCollection): Promise<any> => {
  try {
    const resp = await postRequest(`${API_NFT_COLLECTIONS}`, body, {
      headers: {
        Authorization: token,
      },
    });

    return resp.data;
  } catch (e) {
    console.log({ e });
  }
};
