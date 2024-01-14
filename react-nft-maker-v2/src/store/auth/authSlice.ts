import { ActionReducerMapBuilder, createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';

import { ACCOUNT_ID_PREFIX } from '@/constants/api';
import { deleteService, deleteVerifyService } from '@/services/auth/deleteService';
import { verifyJWTService } from '@/services/auth/jtwService';
import { loginService } from '@/services/auth/loginService';
import { signupService } from '@/services/auth/signupService';
import { updateUser } from '@/services/auth/userService';
import { validateToken } from '@/services/auth/validateToken';
import { verifyPasscode } from '@/services/auth/verifyPasscode';

import { ILoginRequest, IVerificationRequest, ResponseUser, User, UserState, Wallet, NewSignupFlowStep } from './types';

export const initialState: UserState = {
  user: {
    phone: '',
    email: '',
    type: '',
    userId: '',
    accountId: '',
    countryCode: '',
  },
  allWallet: [],
  token: '',
  isAuthenticated: false,
  status: '',
  otp: '',
  otpVerified: false,
  error: '',
  otpSent: false,
  actionWalletId: '',
  deleteOtpVerified: false,
  deleteOtpSent: false,
  justSignedUp: false,
  newSignupFlowStep: NewSignupFlowStep.importContact,
  newSignupCreateShare: false,
};

//An example to use redux-thunk
export const verifyPasscodeThunk = createAsyncThunk(
  'users/verifyPasscode',
  async (requestData: IVerificationRequest) => {
    return await verifyPasscode(requestData);
  }
);

export const validateTokenThunk = createAsyncThunk('users/validateSession', async (token: string) => {
  return await validateToken(token);
});

export const loginUserThunk = createAsyncThunk('users/login', async (requestData: ILoginRequest) => {
  return await loginService(requestData);
});

export const updateUserThunk = createAsyncThunk(
  'users/update',
  async ({ userId, userData }: { userId: string; userData: Partial<User> }) => {
    const res = await updateUser({ userId, userData });
    return userData.firstName && userData.lastName
      ? { user: { ...userData, fullName: `${userData.firstName} ${userData.lastName}` }, res }
      : { user: userData, res };
  }
);

export const signupUserThunk = createAsyncThunk('users/signUp', async (requestData: User) => {
  return await signupService({ requestData });
});

export const verifyJwtThunk = createAsyncThunk('/users/verify-jwt', async ({ token }: { token: string }) => {
  return await verifyJWTService({ token });
});

export const deleteUserThunk = createAsyncThunk(
  'users/delete',
  async ({ userId, type, token }: { userId: string; type: string; token: string }) => {
    return await deleteService({ userId, type, token });
  }
);

export const verifyDeleteThunk = createAsyncThunk('users/deleteVerify', async (_, { getState }) => {
  const { auth } = getState() as { auth: UserState };
  return await deleteVerifyService({ otp: auth.otp as string });
});

const userDataMapper = (oldData: User, res: ResponseUser): User => {
  return {
    email: res.email ? res.email : oldData.email,
    phone: res.phone ? res.phone : oldData.phone,
    type: res.type ? res.type : oldData.type,
    accountId: res.walletId,
    created: res.created,
    fullName: `${res.firstName} ${res.lastName}`,
    firstName: res.firstName,
    lastName: res.lastName,
    status: res.status,
    userId: res.userId,
    verified: res.verified ? res.verified : oldData.verified,
    walletStatus: res.walletStatus ? res.walletStatus : oldData.walletStatus,
    walletId: res.walletId,
    countryCode: res.countryCode,
  };
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuthenticated(state: UserState, { payload }: PayloadAction<boolean>) {
      state.isAuthenticated = payload;
    },
    setUser(state: UserState, { payload }: PayloadAction<User>) {
      state.user = payload;
    },
    setToken(state: UserState, { payload }: PayloadAction<string>) {
      state.token = payload;
    },
    setOtp(state: UserState, { payload }: PayloadAction<string>) {
      state.otp = payload;
    },
    clearError(state: UserState) {
      state.error = '';
    },
    resetUser: () => {
      return initialState;
    },
    resetOtpSent(state: UserState) {
      state.otpSent = false;
    },
    resetStatus: (state: UserState) => {
      state.status = '';
    },
    resetVerificationStatus: (state: UserState) => {
      state.status = '';
    },
    switchWallet: (state: UserState, { payload }: PayloadAction<any>) => {
      state.status = 'Walet Switched Successfully';
      state.user = { ...state.user, ...payload };
    },
    setWallet: (state: UserState) => {
      state.allWallet = state.draftWallet ? [...state.allWallet, state.draftWallet] : state.allWallet;
      state.draftWallet = undefined;
    },
    setWalletDraft: (state: UserState, { payload }: PayloadAction<any>) => {
      state.draftWallet = payload;
    },
    setActionWalletId: (state: UserState, { payload }: PayloadAction<any>) => {
      state.actionWalletId = payload;
    },
    removeWallet: (state: UserState, { payload }: PayloadAction<any>) => {
      state.allWallet = payload;
    },
    setJustSignedUp: (state: UserState, { payload }: PayloadAction<boolean>) => {
      state.justSignedUp = payload;
    },
    setSkipContact: (state: UserState, { payload }: PayloadAction<boolean>) => {
      state.skipContactAndMint = payload;
    },
    setNewSignupFlowStep: (state: UserState, { payload }: PayloadAction<NewSignupFlowStep>) => {
      state.newSignupFlowStep = payload;
    },
    setNewSignupCreateShare: (state: UserState, { payload }: PayloadAction<boolean>) => {
      state.newSignupCreateShare = payload;
    },
  },
  // redux thunk will be added in extraReducers
  extraReducers: (builder: ActionReducerMapBuilder<UserState>) => {
    // Pending state of API
    builder.addCase(verifyPasscodeThunk.pending, (state: UserState) => {
      state.status = '';
      state.otpVerified = false;
    });

    // On getting API response
    builder.addCase(verifyPasscodeThunk.fulfilled, (state: UserState, { payload }) => {
      state.status = 'Verification code verified';
      state.token = payload.jwtAccessToken;
      state.user = {
        ...state.user,
        ...payload.user,
        fullName: `${payload.user.firstName} ${payload.user.lastName}`,
      };
      state.allWallet = [
        {
          fullName: payload.user.firstName + ' ' + payload.user.lastName,
          walletId: payload.user.walletName,
          email: payload.user.email,
          phone: payload.user.phone,
        },
      ];
      state.actionWalletId = payload.user.walletName;

      state.otpVerified = true;
      state.otpSent = false;
    });

    // On promise rejection
    builder.addCase(verifyPasscodeThunk.rejected, (state: UserState, { error }) => {
      state.status = '';
      state.otp = '';
      state.error = error.message;
      state.otpVerified = false;
    });

    // Pending state of API
    builder.addCase(validateTokenThunk.pending, (state: UserState) => {
      state.status = 'loading';
    });

    // On getting API response
    builder.addCase(validateTokenThunk.fulfilled, (state: UserState, { payload }) => {
      state.status = '';
      state.token = payload.token;
    });

    // On promise rejection
    builder.addCase(validateTokenThunk.rejected, (state: UserState, { error }) => {
      state.status = '';
      state.token = '';
      state.error = error.message;
    });

    // Pending state of API
    builder.addCase(signupUserThunk.pending, (state: UserState) => {
      state.status = 'loading';
    });

    // On getting API response
    builder.addCase(signupUserThunk.fulfilled, (state: UserState, { payload }) => {
      const walletName = payload.response.data.user.walletName || '';
      state.status = '';
      state.user = {
        ...userDataMapper(state.user, payload.response.data.user),
        accountId: walletName.includes(ACCOUNT_ID_PREFIX) ? walletName : `${walletName}${ACCOUNT_ID_PREFIX}`,
        countryCode: payload.response.data.user.countryCode,
      };
      state.actionWalletId = walletName || '';
      state.token = payload.response.data.jwtAccessToken;
      const walletArray: Wallet[] = state.allWallet || [];
      state.allWallet = [
        ...walletArray,
        {
          fullName: state.user.fullName,
          walletId: state.user.accountId,
          email: state.user.email,
          phone: state.user.phone,
        },
      ];
      state.justSignedUp = true;
      state.newSignupFlowStep = NewSignupFlowStep.importContact;
      state.newSignupCreateShare = false;
    });

    // On promise rejection
    builder.addCase(signupUserThunk.rejected, (state: UserState, { error }) => {
      state.status = '';
      state.error = error.message;
    });

    // Pending state of API
    builder.addCase(verifyJwtThunk.pending, (state: UserState) => {
      state.status = 'loading';
    });

    // On getting API response
    builder.addCase(verifyJwtThunk.fulfilled, (state: UserState, { payload }) => {
      state.status = '';
      console.log('verifyJwtThunk payload', payload);

      state.status = 'Verification code verified';
      state.token = payload.response.token;
      state.user = {
        ...state.user,
        ...payload.response,
        fullName: `${payload.response.firstName} ${payload.response.lastName}`,
      };
      state.allWallet = [
        {
          fullName: payload.response.firstName + ' ' + payload.response.lastName,
          walletId: payload.response.walletName,
          email: payload.response.email,
          phone: payload.response.phone,
        },
      ];
      state.actionWalletId = payload.response.walletName;
      state.user.accountId = payload.response.walletName;
      state.isAuthenticated = true;
    });

    // On promise rejection
    builder.addCase(verifyJwtThunk.rejected, (state: UserState, { error }) => {
      state.status = '';
      state.error = error.message;
    });

    builder.addCase(loginUserThunk.pending, (state: UserState) => {
      state.status = '';
      state.otpSent = false;
    });

    builder.addCase(loginUserThunk.fulfilled, (state: UserState, { payload }) => {
      state.status = payload.response.message;
      state.user.type = payload.response.channelType;
      state.user.email = payload.response.email;
      state.user.phone = payload.response.phone;
      state.user.countryCode = payload.response.countryCode;
      state.otpSent = true;
    });
    builder.addCase(loginUserThunk.rejected, (state: UserState, { error }) => {
      state.status = '';
      state.error = error.message;
      state.otpSent = false;
    });
    builder.addCase(updateUserThunk.pending, (state: UserState) => {
      state.status = '';
    });
    builder.addCase(updateUserThunk.rejected, (state: UserState, { error }) => {
      state.status = '';
      state.error = error.message;
    });
    builder.addCase(updateUserThunk.fulfilled, (state: UserState, { payload }) => {
      state.status = payload?.res?.response?.message || '';
      state.user = { ...state.user, ...payload.user };
    });
    builder.addCase(deleteUserThunk.pending, (state: UserState) => {
      state.status = '';
      state.error = '';
    });
    builder.addCase(deleteUserThunk.rejected, (state: UserState, { error }) => {
      state.status = '';
      state.error = error.message;
      state.deleteOtpSent = false;
    });
    builder.addCase(deleteUserThunk.fulfilled, (state: UserState) => {
      state.status = 'Otp sent';
      state.error = '';
      state.deleteOtpSent = true;
    });

    builder.addCase(verifyDeleteThunk.pending, (state: UserState) => {
      state.status = '';
      state.error = '';
    });

    builder.addCase(verifyDeleteThunk.rejected, (state: UserState, { error }) => {
      state.status = '';
      state.error = error.message;
      state.otpVerified = false;
      state.deleteOtpVerified = false;
    });

    builder.addCase(verifyDeleteThunk.fulfilled, (state: UserState) => {
      state.status = '';
      state.token = '';
      state.error = '';
      state.otpVerified = true;
      state.deleteOtpVerified = true;
    });
  },
});

export const {
  setAuthenticated,
  resetUser,
  setUser,
  setToken,
  setOtp,
  clearError,
  switchWallet,
  setWallet,
  setWalletDraft,
  removeWallet,
  setActionWalletId,
  resetStatus,
  resetOtpSent,
  resetVerificationStatus,
  setJustSignedUp,
  setSkipContact,
  setNewSignupFlowStep,
  setNewSignupCreateShare,
} = authSlice.actions;

export default authSlice.reducer;
