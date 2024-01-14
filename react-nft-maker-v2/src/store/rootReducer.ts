import { combineReducers } from '@reduxjs/toolkit';

import auth from './auth';
import commonData from './common';
import contacts from './contacts';
import dialogsStatus from './dialogs';
import nftDetails from './nft';
import transactionsDetails from './transactions';
import wallets from './wallet';

const rootReducer = combineReducers({
  auth,
  contacts,
  nftDetails,
  dialogsStatus,
  transactionsDetails,
  commonData,
  wallets,
});

export type AppState = ReturnType<typeof rootReducer>;
export default rootReducer;
