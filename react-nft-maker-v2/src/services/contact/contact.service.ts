import { API_CONTACT, API_FETCH_CONTACTS, API_IMPORT_CONTACT } from '@/constants/api';
import { getErrorMessage } from '@/utils/helper';

import { getRequest, postRequest } from '../utils';

export const importContactService = async (
  contactNumbers: any[],
  userId: any
): Promise<{
  response: any;
}> => {
  let i, j;
  const temporary: any = [];

  // setting max payload size
  const chunk = 1024;
  for (i = 0, j = contactNumbers.length; i < j; i += chunk) {
    temporary.push(contactNumbers.slice(i, i + chunk));
  }
  let response = { response: '' };
  let error = '';

  for (let x = 0; x < temporary.length; x++) {
    try {
      const resp = await postRequest(`${API_IMPORT_CONTACT(userId)}`, temporary[x]);
      response = { response: resp.data };
    } catch (e: any) {
      error = getErrorMessage(e);
    }
  }

  if (error) return { response: error };
  return response;
};

export const getContactsList = async (userId: any): Promise<any> => {
  try {
    const { data } = await getRequest(`${API_FETCH_CONTACTS(userId)}`);
    return data;
  } catch (e: any) {
    throw new Error(getErrorMessage(e));
  }
};

export const createContact = async (requestBody: any, userId: string | undefined): Promise<any> => {
  try {
    if (requestBody.email && requestBody.email[0].address.length === 0) {
      delete requestBody.email;
    } else if (requestBody.phone[0].number.length < 2) {
      delete requestBody.phone;
    }
    const { data } = await postRequest(`${API_CONTACT}/${userId}`, requestBody);
    return transformData(data);
  } catch (e: any) {
    throw new Error(getErrorMessage(e));
  }
};

const transformData = ({ data }: { data: any }) => {
  const {
    contactJSON: { contactId, email, firstName, lastName, phone, userId },
  } = data;

  return {
    contactId,
    email,
    phone,
    userId,
    firstName,
    lastName,
  };
};
