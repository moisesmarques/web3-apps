import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { ITransactionsStore } from './types';

const initialState: ITransactionsStore = {
  allTransactions: [],
};

const transactionsSlice = createSlice({
  name: 'transactionsDetails',
  initialState,
  reducers: {
    setAllTransactions(state: ITransactionsStore, { payload }: PayloadAction<[]>) {
      state.allTransactions = payload;
    },
  },
});

export const { setAllTransactions } = transactionsSlice.actions;

export default transactionsSlice.reducer;
