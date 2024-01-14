import '@testing-library/jest-dom';
import store from '@/store';

import auth, { initialState, signupUserThunk, validateTokenThunk, setUser } from './authSlice';
import { SIGN_UP_MOCK_DATA, MOCKED_USER_DATA, ERROR_MESSAGE } from '@/mocks/auth/signup.mock';

describe('Auth redux state tests', () => {
  it('should compare initial values of auth', () => {
    const state = store.getState().auth;
    expect(state).toEqual(initialState);
  });

  it('should sets user when setUser action is dispatched', () => {
    const action = { type: setUser, payload: MOCKED_USER_DATA };
    const state = auth(initialState, action);
    expect(state.user).toEqual(MOCKED_USER_DATA);
  });

  it('should set isAuthenticated when setAuthenticated action is dispatched', () => {
    const action = { type: setUser, payload: false };
    const state = auth(initialState, action);
    expect(state.isAuthenticated).toEqual(false);
  });

  it('should sets status loading when validateTokenThunk is pending', () => {
    const action = { type: validateTokenThunk.pending.type };
    const state = auth(initialState, action);
    expect(state.status).toEqual('loading');
  });

  it('should sets token when validateTokenThunk is fulfilled', () => {
    const action = { type: validateTokenThunk.fulfilled.type, payload: { token: SIGN_UP_MOCK_DATA.jwt_access_token } };
    const state = auth(initialState, action);
    expect(state.token).toEqual(SIGN_UP_MOCK_DATA.jwt_access_token);
  });

  it('should sets error to ERROR_MESSAGE when validateTokenThunk is rejected', () => {
    const action = { type: validateTokenThunk.rejected.type, error: { message: ERROR_MESSAGE } };
    const state = auth(initialState, action);
    expect(state.error).toEqual(ERROR_MESSAGE);
  });

  it('should sets status loading when signupUserThunk is pending', () => {
    const action = { type: signupUserThunk.pending.type };
    const state = auth(initialState, action);
    expect(state.status).toEqual('loading');
  });

  it('should sets user and token when signupUserThunk is fulfilled', () => {
    const action = { type: signupUserThunk.fulfilled.type, payload: { response: SIGN_UP_MOCK_DATA } };
    const state = auth(initialState, action);
    expect(state.user).toEqual(MOCKED_USER_DATA);
    expect(state.token).toEqual(SIGN_UP_MOCK_DATA.jwt_access_token);
  });

  it('should sets error to ERROR_MESSAGE when signupUserThunk is rejected', () => {
    const action = { type: signupUserThunk.rejected.type, error: { message: ERROR_MESSAGE } };
    const state = auth(initialState, action);
    expect(state.error).toEqual(ERROR_MESSAGE);
  });
});
