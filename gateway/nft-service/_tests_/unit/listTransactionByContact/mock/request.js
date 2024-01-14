const wallets = [
  {
    status: 'pending',
    created: '2022-03-28T09:37:47.331Z',
    walletId: 'demo009.near',
    transactionId: 'ehu4p6IxPdFK3ocpglvrd',
    isBlockchainVerified: 'verified',
    kycProvider: 'kyc_provider',
    balance: '0.00',
    publicKey: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    updated: '2022-03-28T09:37:47.331Z',
    walletName: 'demo009.near',
    storageProvider: 'storage_provider',
    userId: 'dvn5T2dvFXp-qdZBNMOiz',
    blockchainHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
  },
];

const transaction = {
  operation: 'create_and_mint_nft',
  status: 'complete',
  created: 1648467527699,
  jobId: 'l8xplhmzc6vaenkighod',
  transactionId: 'l8xpLhMZc-6vaenkIgHOD',
  requestParams: '{"senderWalletId":"demo009.near","ownerWalletId":"demo009.near","ownerId":"dvn5T2dvFXp-qdZBNMOiz","type":"create_and_mint_nft","name":"Test 4 from Ashas without token","capacity":"1","appId":"sdtupj5pfbmtpypibaj","actionId":"x14u1ssqo9m8ip07yevn7","media":"hhmjohikakqe45u9jci65","reference":"9ydl8qh36xn5s43hmyur1","deposit":"0.1"}',
  ownerWalletId: 'demo009.near',
  updated: 1648467527699,
  senderWalletId: 'demo009.near',
  appId: 'sdtupj5pfbmtpypibaj',
  blockchainStatus: 'pending',
  type: 'nft_series_create',
  actionId: 'x14u1ssqo9m8ip07yevn7',
};

const jwtMock = {
  lastName: 'Kivite',
  userId: '_BE_Ou5exXqW-wFLuTxud',
  status: 'active',
  created: 1646209318710,
  isPhoneVerified: false,
  email: 'tkivite@gmail.com',
  firstName: 'Titus',
  isEmailVerified: false,
  walletName: 'titusWallet.near',
  walletId: 'titusWallet.near',
  iat: 1646327133,
};

const AuthCode = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJsYXN0TmFtZSI6Iktpdml0ZSIsInVzZXJJZCI6Il9CRV9PdTVleFhxVy13Rkx1VHh1ZCIsInN0YXR1cyI6ImFjdGl2ZSIsImNyZWF0ZWQiOjE2NDYyMDkzMTg3MTAsImlzUGhvbmVWZXJpZmllZCI6ZmFsc2UsImVtYWlsIjoidGtpdml0ZUBnbWFpbC5jb20iLCJmaXJzdE5hbWUiOiJUaXR1cyIsImlzRW1haWxWZXJpZmllZCI6ZmFsc2UsIndhbGxldE5hbWUiOiJ0aXR1c1dhbGxldC5uZWFyIiwiaWF0IjoxNjQ2MzI3MTMzLCJleHAiOjE2NDY0MTM1MzN9.PFA57GwzBuIM8O04XICee1xFTciApptbDCGTjTWPtyU';
const contactId = '573f98829831a4322746a5693e56fcc4b6479c44cdd29d2cd16977927d3e1021';
const emptyPayload = {};
const ownerId = 'demo009.near';

module.exports = {
  emptyPayload, AuthCode, contactId, jwtMock, wallets, transaction, ownerId,
};
