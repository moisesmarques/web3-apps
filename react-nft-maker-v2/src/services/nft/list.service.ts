import { API_NFT_LIST, API_FILES } from '@/constants/api';

import { getRequest } from '../utils';

export interface INftItemType {
  id: string;
  title: string;
  status: string;
  description: string;
  category: string;
  actionType: string;
  createdAt: string;
  updatedAt: string;
  fileUrl: string;
  ownerId: string;
  attributes: INftAttributes[];
  isSelected: boolean;
}

export interface IServerNftItemType {
  title: string;
  description: string;
  collectionId: string;
  categoryId: string;
  filePath: string;
  tags: string[];
  nftId: string;
  isSelected: boolean;
}

export type INftAttributes = {
  attributeName: string;
  attributeValue: string;
};

export enum NFT_STATUS {
  ACTIVE = 'active',
  UNCLAIMED_GIFT = 'unclaimed_gift',
}

export const getNftListDataService = async (token: string): Promise<INftItemType[]> => {
  const resp = await getRequest(API_NFT_LIST, {
    headers: {
      Authorization: token,
    },
  });
  return transformData(resp.data?.data);
};

export const getFileNftListDataService = async (walletId: string | undefined, token: string) => {
  const resp = await getRequest(`${API_FILES}/${walletId}/storage`, {
    headers: {
      Authorization: token,
    },
  });

  return transformData(resp.data?.data);
};

const transformData = (serverData: IServerNftItemType[]): INftItemType[] => {
  return serverData.map((item) => {
    const { title, categoryId, filePath, description, nftId } = item;
    return {
      id: nftId,
      title,
      status: '',
      description,
      category: categoryId,
      actionType: '',
      createdAt: '',
      updatedAt: '',
      fileUrl: filePath,
      ownerId: '',
      attributes: [],
      isSelected: false,
    };
  });
};
