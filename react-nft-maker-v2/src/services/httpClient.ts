import axios from 'axios';

import { store } from 'src/store';

export const setupHttpClient = (reduxStore: typeof store, onUnauthorizedCallback: () => void) => {
  const {
    auth: { token },
  } = reduxStore.getState();

  axios.interceptors.request.use((config) => {
    config.headers = config.headers || {};

    if (token && !config.headers.Authorization) {
      config.headers.authorization = `${token}`;
    }

    return config;
  });

  axios.interceptors.response.use(
    (res) => res,
    (error) => {
      const status = error.response && error.response.status;
      if (status === 401) {
        onUnauthorizedCallback();
      }
      return Promise.reject(error);
    }
  );
};
