import { createSelector } from 'reselect';

import { AppState } from '../rootReducer';

export const getAuthDataSelector = (state: AppState) => state.auth;

export const getAuthUserSelector = createSelector(getAuthDataSelector, (authData) => authData.user);
export const getToken = createSelector(getAuthDataSelector, (authData) => authData.token);
