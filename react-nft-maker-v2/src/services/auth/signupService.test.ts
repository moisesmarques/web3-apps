import '@testing-library/jest-dom';
import axios from 'axios';

import { signupService } from './signupService';
import { MOCKED_USER_DATA, SIGN_UP_MOCK_DATA, ERROR_MESSAGE } from '@/mocks/auth/signup.mock';

jest.mock('axios');
describe('Sign Up Service test', () => {
  it('should return data when promise is success ', async () => {
    const payload = { data: SIGN_UP_MOCK_DATA };
    axios.post = jest.fn().mockResolvedValue(payload);
    const resp = await signupService({ requestData: MOCKED_USER_DATA });
    expect(resp).toEqual({ response: SIGN_UP_MOCK_DATA });
  });
  it('should throw error when promise is rejected ', async () => {
    axios.post = jest.fn().mockRejectedValue({ error: ERROR_MESSAGE });
    expect.assertions(1);
    await signupService({ requestData: MOCKED_USER_DATA }).catch((error) => {
      expect(error).toBeTruthy();
    });
  });
});
