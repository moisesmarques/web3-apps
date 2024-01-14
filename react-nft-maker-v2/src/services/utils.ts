import axios, { AxiosRequestConfig } from 'axios';

import { API_URL, REQUEST_HEADERS } from '@/constants/api';

import { onUnauthorizedCallback } from '../store';
import { IRequestBody } from './service.types';

export const postRequest = (url: string, body: IRequestBody | any, config?: AxiosRequestConfig) => {
  return axios.post(API_URL + url, body, config);
};

export const postRequestExternal = (url: string, body: IRequestBody | any, config?: AxiosRequestConfig) => {
  return axios.post(url, body, config);
};

export const postRequestWithToken = (url: string, token: string, config?: AxiosRequestConfig) => {
  return axios
    .post(
      API_URL + url,
      { token },
      {
        ...config,
        headers: { ...REQUEST_HEADERS, authorization: `${token}`, ...config?.headers },
      }
    )
    .catch((error) => {
      const status = error.response && error.response.status;
      if (status === 401) {
        onUnauthorizedCallback();
      }
      return Promise.reject(error);
    });
};

export const putRequest = (url: string, body: IRequestBody | any) => {
  return axios.put(API_URL + url, body).catch((error) => {
    const status = error.response && error.response.status;
    if (status === 401) {
      onUnauthorizedCallback();
    }
    return Promise.reject(error);
  });
};

export const getRequest = (url: string, config?: AxiosRequestConfig) => {
  return axios
    .get(API_URL + url, {
      ...config,
      headers: {
        ...REQUEST_HEADERS,
        ...config?.headers,
      },
    })
    .catch((error) => {
      const status = error.response && error.response.status;
      if (status === 401) {
        onUnauthorizedCallback();
      }
      return Promise.reject(error);
    });
};

export const deleteRequest = (url: string, body: IRequestBody, token: string) => {
  return axios
    .delete(API_URL + url, {
      headers: {
        Authorization: token,
      },
      data: body,
    })
    .catch((error) => {
      const status = error.response && error.response.status;
      if (status === 401) {
        onUnauthorizedCallback();
      }
      return Promise.reject(error);
    });
};
