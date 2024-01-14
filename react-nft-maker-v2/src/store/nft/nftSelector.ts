import { createSelector } from 'reselect';

import { RootState } from '@/store';

import { AppState } from '../rootReducer';

export const getNftSelector = (state: AppState) => state.nftDetails;
export const getNtfCreateStatus = (state: AppState) => ({
  currentStep: state.nftDetails.currentStep,
  message: state.nftDetails.message,
  error: state.nftDetails.error,
});

export const getCreateNFTAttributesSelector = createSelector(
  getNftSelector,
  (nftDetails) => nftDetails.data.attributesData
);

export const getCreateNFTAttributesIdSelector = createSelector(
  getCreateNFTAttributesSelector,
  (attributesData) => attributesData?.ids
);

export const getCreateNFTAttributesDataSelector = createSelector(
  getCreateNFTAttributesSelector,
  (attributesData) => attributesData?.data
);

export const getCreateNFTAttributesDataByIdSelector = createSelector(
  getCreateNFTAttributesDataSelector,
  (state: RootState, id: string) => id,
  (data, id) => data?.[id]
);

export const createNewNFTCategorySelector = createSelector(getNftSelector, (nftDetails) => nftDetails.data.category);

export const selectedFileSelector = createSelector(getNftSelector, (nftDetails) => nftDetails.selectedFile);
export const allNftSelector = createSelector(getNftSelector, (nftDetails) => nftDetails.allNfts);
