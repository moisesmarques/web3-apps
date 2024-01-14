import { ActionReducerMapBuilder, createAsyncThunk, createSlice, nanoid, PayloadAction } from '@reduxjs/toolkit';

import { NFT_CATEGORY_ID } from '@/constants/appId';
import { uploadNftFile } from '@/services/files/create.service';
import { claimNftService } from '@/services/nft/claim.service';
import {
  CreateNFTData,
  createNftService,
  IConversionData,
  nftAdConversionService,
} from '@/services/nft/create.service';
import { getNFTDetails } from '@/services/nft/dashboard.service';
import { INftItemType } from '@/services/nft/list.service';

import { CreateNftStepType, INftData, INFTDetails } from './types';

const initialAttributesId = nanoid();

const initialState: INFTDetails = {
  data: {
    actionType: '',
    attributes: [],
    category: '',
    created: 0,
    description: '',
    fileUrl: '',
    nftId: '',
    ownerId: '',
    status: '',
    title: '',
    updated: 0,
    claimToken: '',
    owner: {
      created: 0,
      email: '',
      fullName: '',
      status: '',
      userId: '',
      verified: false,
      walletStatus: '',
      walletId: '',
    },
    ownerWalletId: '',
    attributesData: {
      ids: [initialAttributesId],
      data: {
        [initialAttributesId]: {
          attributeName: '',
          attributeValue: '',
        },
      },
    },
  },
  message: '',
  status: '',
  error: '',
  currentStep: null,
  allNfts: [],
  fromScreen: 'main',
};

export const nftDetailsThunk = createAsyncThunk('nftDetails/getDetails', async (nftId: string) => {
  return await getNFTDetails(nftId);
});

type ICreateNftThunk = {
  file: File | undefined;
  body: CreateNFTData;
  token: string;
  walletId: string;
  ownerId: string;
};

export type IClaimNftThunk = {
  nftId: string | undefined;
  claimToken?: string | undefined;
};

export const createNftThunk = createAsyncThunk('nftDetails/createNft', async (data: ICreateNftThunk) => {
  const { token, body, walletId, file } = data;
  const { filePath } = await uploadNftFile({ walletId, file, token });

  //Put fixed categoryId for now since category is not yet implemented
  return await createNftService({
    body: {
      ...body,
      categoryId: NFT_CATEGORY_ID,
      filePath,
    },
    token,
    walletId,
  });
});

export const claimNftThunk = createAsyncThunk('nftDetails/claimNft', async (data: IClaimNftThunk) => {
  const { nftId, claimToken } = data;

  return await claimNftService({ nftId, claimToken });
});

export const nftAdConversionThunk = createAsyncThunk('nftDetails/adConversion', async (data: IConversionData) => {
  return await nftAdConversionService(data);
});

const nftSlice = createSlice({
  name: 'nftDetails',
  initialState,
  reducers: {
    createNewNFT(state: INFTDetails) {
      const newAttributeId = nanoid();
      state.data.attributesData = {
        ids: [newAttributeId],
        data: {
          [newAttributeId]: {
            attributeName: '',
            attributeValue: '',
          },
        },
      };
    },
    addAttribute(state: INFTDetails) {
      const newAttributeId = nanoid();
      if (state.data.attributesData) {
        state.data.attributesData.ids.push(newAttributeId);
        state.data.attributesData.data[newAttributeId] = {
          attributeName: '',
          attributeValue: '',
        };
      }
    },
    removeAttribute(state: INFTDetails, { payload }: PayloadAction<string>) {
      if (state.data.attributesData) {
        state.data.attributesData.ids = state.data.attributesData.ids.filter((id) => id !== payload);
        delete state.data.attributesData.data[payload];
      }
    },
    setAttributeData(
      state: INFTDetails,
      {
        payload,
      }: PayloadAction<
        | {
            id: string;
            field: 'attributeName' | 'attributeValue';
            value: string;
          }
        | undefined
      >
    ) {
      if (state.data.attributesData) {
        if (payload) {
          state.data.attributesData.data[payload.id][payload.field] = payload.value;
        } else {
          state.data.attributesData = undefined;
        }
      }
    },
    setSelectedFile(state: INFTDetails, { payload }: PayloadAction<File | undefined>) {
      state.selectedFile = payload;
    },
    setCreateNFTFormData(state: INFTDetails, { payload }: PayloadAction<Partial<INftData>>) {
      if (payload.title && payload.description) {
        state.data.title = payload.title;
        state.data.description = payload.description;
      }
    },
    setCategory(state: INFTDetails, { payload }: PayloadAction<string>) {
      state.data.category = payload;
    },
    setNftDetails(state: INFTDetails, { payload }: PayloadAction<INFTDetails>) {
      state = payload;
    },
    changeStep(state: INFTDetails, { payload }: PayloadAction<CreateNftStepType>) {
      state.currentStep = payload;
    },
    clearNftErrors(state: INFTDetails) {
      state.message = '';
      state.status = '';
      state.error = '';
    },
    setFromScreen(state: INFTDetails, { payload }: PayloadAction<string>) {
      state.fromScreen = payload;
    },
    setAllNfts(state: INFTDetails, { payload }: PayloadAction<INftItemType[] | [] | undefined>) {
      state.allNfts = payload;
    },
    resetNftDetails: () => initialState,
    resetStep(state: INFTDetails) {
      state.currentStep = null;
    },
    sendNftSuccess(state: INFTDetails, { payload }: PayloadAction<string>) {
      state.sendNftSuccess = payload;
    },
    resetSendNftSuccess(state: INFTDetails) {
      delete state.sendNftSuccess;
    },
  },
  extraReducers: (builder: ActionReducerMapBuilder<INFTDetails>) => {
    builder.addCase(nftDetailsThunk.pending, (state: INFTDetails) => {
      state.status = 'loading';
      state.error = '';
    });

    builder.addCase(nftDetailsThunk.fulfilled, (state: INFTDetails, { payload }) => {
      state.data = payload.data;
      state.message = payload.message;
      state.error = '';
      state.status = '';
    });

    builder.addCase(nftDetailsThunk.rejected, (state: INFTDetails, { error }) => {
      state.error = error.message;
    });

    builder.addCase(createNftThunk.pending, (state: INFTDetails) => {
      state.data = { ...initialState.data };
      state.error = '';
      state.status = 'loading';
    });

    builder.addCase(createNftThunk.fulfilled, (state: INFTDetails, { payload }) => {
      state.data = { ...state.data, ...payload.data };
      state.message = payload.message;
      state.error = '';
      state.status = '';
      state.currentStep = 'success';
    });

    builder.addCase(createNftThunk.rejected, (state: INFTDetails, { error }) => {
      state.error = error.message;
      state.status = 'error';
      state.currentStep = 'error';
    });
  },
});

export const {
  setNftDetails,
  resetNftDetails,
  resetStep,
  createNewNFT,
  setSelectedFile,
  setCreateNFTFormData,
  setAttributeData,
  removeAttribute,
  addAttribute,
  setCategory,
  changeStep,
  clearNftErrors,
  setFromScreen,
  setAllNfts,
  sendNftSuccess,
  resetSendNftSuccess,
} = nftSlice.actions;

export default nftSlice.reducer;
