import { AppState } from '../rootReducer';

export const getContactsSelector = (state: AppState) => state.contacts;
