import { ActionReducerMapBuilder, createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { createWalletService } from '@/services/wallet/createWalletService';

import { ICreateWalletServiceRequestProps, Wallet } from './types';

export const initialState: Wallet = {
  walletName: '',
  isLoading: false,
  error: false,
};

export const createWalletThunk = createAsyncThunk(
  'wallets',
  async ({ walletName, email, phone, userId }: ICreateWalletServiceRequestProps) => {
    return await createWalletService({ walletName, email, phone, userId });
  }
);

const walletSlice = createSlice({
  name: 'wallets',
  initialState,
  reducers: {
    resetWallet: () => initialState,
  },
  extraReducers: (builder: ActionReducerMapBuilder<Wallet>) => {
    builder.addCase(createWalletThunk.pending, (state: Wallet) => {
      state.isLoading = true;
      state.error = false;
    });

    builder.addCase(createWalletThunk.fulfilled, (state: Wallet) => {
      state.isLoading = false;
      state.error = false;
    });

    builder.addCase(createWalletThunk.rejected, (state: Wallet) => {
      state.isLoading = false;
      state.error = true;
    });
  },
});

export const { resetWallet } = walletSlice.actions;

export default walletSlice.reducer;
