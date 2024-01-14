import { API_DASHBOARD_DATA, API_NFT } from '@/constants/api';
import { INFTDetails } from '@/store/nft/types';
import { getErrorMessage } from '@/utils/helper';

import { getRequest } from '../utils';

export interface IDashboardData {
  name: string;
  role: string;
  title: string;
}

export interface IServerNftItemType {
  nftId: string;
  categoryId: string;
  created: number;
  filePath: string;
  description: string;
  collectionId: string;
  tags: string[];
  title: string;
  claimToken?: string | undefined;
  ownerWalletId: string;
}

export const getDashboardData = async (): Promise<IDashboardData[]> => {
  const { data } = await getRequest(API_DASHBOARD_DATA);
  return data;
};

export const getNFTDetails = async (nftId: string): Promise<any> => {
  try {
    const { data } = await getRequest(`${API_NFT}/${nftId}`);
    return transformData(data.data);
  } catch (e: any) {
    throw new Error(getErrorMessage(e));
  }
};

const transformData = (serverData: IServerNftItemType): INFTDetails => {
  const { nftId, title, description, created, filePath, categoryId, claimToken, ownerWalletId } = serverData;
  return {
    data: {
      ownerWalletId,
      nftId,
      title,
      description,
      claimToken,
      category: categoryId,
      actionType: '',
      created,
      updated: created,
      fileUrl: filePath,
      status: '',
      attributes: [],
      ownerId: '',
      owner: {
        created,
        email: '',
        status: '',
        fullName: '',
        userId: '',
        verified: true,
        walletStatus: '',
        walletId: '',
      },
    },
    message: '',
    error: '',
    status: '',
    currentStep: null,
  };
};
