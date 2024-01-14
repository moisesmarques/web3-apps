export const REQUEST_HEADERS = {
  'Content-Type': 'application/json',
  Accept: 'application/json',
};

export const API_URL = `${process.env.API_BASE_URL}`;
export const ACCOUNT_ID_PREFIX = `${process.env.ACCOUNT_ID_PREFIX}`;
export const API_SIGNIN = '/users/login';
export const API_SIGNUP = '/users';
export const API_DASHBOARD_DATA = '/api/dashboard';
export const VALIDATE_TOKEN = '/api/validate_token';
export const API_NFT_LIST = '/nfts/list';
export const API_NFT = '/nfts';
export const API_NFT_COLLECTIONS = '/nfts/collections';
export const VERIFY_PASSCODE = '/users/login/verify';
export const VERIFY_DELETE_PASSCODE = '/users/verify-delete-otp/verify';
export const VERIFY_JWT = '/users/verify-jwt';
export const API_DELETE_USER = (userId: string) => `/users/delete/${userId}`;
export const API_TRANSACTION_DATA = (walletId: string) => `/transactions/list?senderWalletId=${walletId}`;
export const API_CONTACT = '/contacts';
export const API_IMPORT_CONTACT = (userId: string) => `/contacts/${userId}/import`;
export const API_USER = '/users';
export const API_FETCH_CONTACTS = (userId: string) => `/contacts/${userId}/list`;
export const API_WALLETS = '/wallets';
export const API_FILES = `/wallets`;
export const API_FILES_CREATE = (walletId: string) => `/wallets/${walletId}/storage`;
export const SEND_NFT_API = (nftId: string) => `/nfts/${nftId}/send`;
export const GIFT_NFT_API = (nftId: string) => `/nfts/${nftId}/gift`;
export const API_NFT_AD_CONVERSION = 'https://fcnefunrz6.execute-api.us-east-1.amazonaws.com/test/conversion';
export const NEAR_TRANSACTION_URL = 'https://explorer.near.org/transactions/';
export const API_SEED_PHRASE = '/users/seedphrase';
