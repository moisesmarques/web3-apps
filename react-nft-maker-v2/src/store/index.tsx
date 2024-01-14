import router from 'next/router';
import { configureStore } from '@reduxjs/toolkit';
import { createLogger } from 'redux-logger';
import { persistReducer, persistStore } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { setupHttpClient } from '@/services/httpClient';
import { resetUser } from '@/store/auth';
import rootReducer from './rootReducer';

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth', 'nftDetails'],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

const logger = createLogger({
  predicate: () => typeof window !== 'undefined',
});

export const store = configureStore({
  reducer: persistedReducer,
  devTools: process.env.NODE_ENV !== 'production',
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(process.env.NODE_ENV === 'development' ? [logger] : []),
});

export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;
export const persistor = persistStore(store);

export const onUnauthorizedCallback = () => {
  store.dispatch(resetUser());
  router.push('/login');
};

persistor.subscribe(() => {
  const { bootstrapped } = persistor.getState();
  if (bootstrapped) {
    // Set up the http client upon rehydrating the persisted store.
    setupHttpClient(store, onUnauthorizedCallback);
  }
});

let currentToken: string | null;

store.subscribe(() => {
  const prevToken = currentToken;
  if (store.getState().auth.token) {
    currentToken = store.getState().auth.token;

    if (prevToken !== currentToken) {
      // Set up the http client upon the auth session update.
      setupHttpClient(store, onUnauthorizedCallback);
    }
  }
});

export default store;
