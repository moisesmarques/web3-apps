import { INftItemType } from '@/services/nft/list.service';

export interface IOwnerType {
  created: number;
  email: string;
  fullName: string;
  status: string;
  userId: string;
  verified: boolean;
  walletStatus: string;
  walletId: string;
}

export interface IAttributesType {
  attributeName: string;
  attributeValue: string;
}

export interface INftData {
  actionType: string;
  attributes: IAttributesType[];
  category: string;
  created: number;
  description: string;
  fileUrl: string;
  nftId: string;
  ownerId: string;
  status: string;
  title: string;
  updated: number;
  owner: IOwnerType;
  claimToken?: string | undefined;
  token_id?: string;
  explorer_url?: string;
  ownerWalletId: string;
  attributesData?: {
    ids: string[];
    data: {
      [id: string]: {
        attributeName: string;
        attributeValue: string;
      };
    };
  };
}

export type CreateNftStepType = null | 'create' | 'success' | 'error' | 'open';

export interface INFTDetails {
  data: INftData;
  message: string;
  status?: string;
  error?: string | undefined;
  currentStep?: CreateNftStepType;
  // to track the previous modal,
  fromScreen?: string;
  allNfts?: INftItemType[] | [] | undefined;
  sendNftSuccess?: string;
  selectedFile?: File;
}
