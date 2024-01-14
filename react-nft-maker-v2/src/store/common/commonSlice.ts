import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { ICommonStore } from './types';

const initialState: ICommonStore = {
  common: {
    activeFooterTab: 'dashboard',
  },
  returnUrl: '',
};

const ICommonSlice = createSlice({
  name: 'ICommonSlice',
  initialState,
  reducers: {
    setActiveFooterTab(state: ICommonStore, { payload }: PayloadAction<string>) {
      state.common.activeFooterTab = payload;
    },
    setReturnUrl(state: ICommonStore, { payload }: PayloadAction<string>) {
      state.returnUrl = payload;
    },
  },
});

export const { setActiveFooterTab, setReturnUrl } = ICommonSlice.actions;

export default ICommonSlice.reducer;
