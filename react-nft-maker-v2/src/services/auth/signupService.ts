import { ACCOUNT_ID_PREFIX, API_SIGNUP } from '@/constants/api';
import { ISignupServiceRequestProps, ISignUpServiceResponse } from '@/store/auth/types';
import { getErrorMessage } from '@/utils/helper';

import { postRequest } from '../utils';

type PayloadRequest = {
  firstName: string;
  lastName: string;
  walletName: string;
  email?: string;
  phone?: string;
  countryCode?: string;
};

export const signupService = async ({
  requestData,
}: ISignupServiceRequestProps): Promise<{
  response: ISignUpServiceResponse;
}> => {
  let firstName = '';
  let lastName = '';
  const fullNameSplit = requestData.fullName ? requestData.fullName.split(' ') : [];

  if (fullNameSplit.length === 1) {
    firstName = fullNameSplit[0];
  }

  if (fullNameSplit.length > 1) {
    firstName = fullNameSplit.slice(0, -1).join(' ');
    lastName = fullNameSplit.slice(-1).join(' ');
  }

  const data: PayloadRequest = {
    firstName: firstName,
    lastName: lastName,
    walletName: `${requestData.accountId + ACCOUNT_ID_PREFIX}`,
    email: requestData.email,
    phone: requestData.phone,
    countryCode: requestData.phone ? (requestData.countryCode ? requestData.countryCode : '+1') : undefined,
  };

  if (requestData.type === 'email') {
    delete data['phone'];
  } else {
    delete data['email'];
  }

  try {
    const resp = await postRequest(API_SIGNUP, data);
    return { response: resp };
  } catch (err: any) {
    throw new Error(getErrorMessage(err));
  }
};
