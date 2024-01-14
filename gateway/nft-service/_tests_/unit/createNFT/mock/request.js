const payload = {
  title: 'Test 4 from Ashas without token',
  description: '',
  filePath:
    'https://www.eathappyproject.com/wp-content/uploads/2020/08/home-decor.jpg',
  tags: ['nft', 'eathappyproject', 'Ashas'],
  categoryId: 'XNwyaIOPKkfc1iFngXorm',
  fileId: '262cff27-0b65-44a2-a194-f98be75b9228',
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

const jwtMock1 = {
  lastName: 'Kivite',
  userId: '_BE_Ou5exXqW-wFLuTxud',
  status: 'active',
  created: 1646209318710,
  isPhoneVerified: false,
  email: 'tkivite@gmail.com',
  firstName: 'Titus',
  isEmailVerified: false,
  walletName: 'titusWallet.near',
  iat: 1646327133,
};

const AuthCode = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJsYXN0TmFtZSI6Iktpdml0ZSIsInVzZXJJZCI6Il9CRV9PdTVleFhxVy13Rkx1VHh1ZCIsInN0YXR1cyI6ImFjdGl2ZSIsImNyZWF0ZWQiOjE2NDYyMDkzMTg3MTAsImlzUGhvbmVWZXJpZmllZCI6ZmFsc2UsImVtYWlsIjoidGtpdml0ZUBnbWFpbC5jb20iLCJmaXJzdE5hbWUiOiJUaXR1cyIsImlzRW1haWxWZXJpZmllZCI6ZmFsc2UsIndhbGxldE5hbWUiOiJ0aXR1c1dhbGxldC5uZWFyIiwiaWF0IjoxNjQ2MzI3MTMzLCJleHAiOjE2NDY0MTM1MzN9.PFA57GwzBuIM8O04XICee1xFTciApptbDCGTjTWPtyU';

const emptyPayload = {};

const invalidPayload = {
  title: 'Test 4 from Ashas without token',
  filePath:
    'https://www.eathappyproject.com/wp-content/uploads/2020/08/home-decor.jpg',
  tags: ['nft', 'eathappyproject', 'Ashas'],
  categoryId: 'XNwyaIOPKkfc1iFngXor',
  fileId: '262cff27-0b65-44a2-a194-f98be75b9228',
};

const nft = {
  title: 'Ashas Test 1  Shift 3',
  description: 'test nft from Ashas from Shift 3',
  categoryId: 'XNwyaIOPKkfc1iFngXorm',
  filePath:
    'https://www.eathappyproject.com/wp-content/uploads/2020/08/home-decor.jpg',
  tags: ['nft', 'eathappyproject', 'Ashas'],
  ownerWalletId: 'ashasahmad.near',
  ownerId: 'RZTiIbxAVfmhVAmdEYclm',
  nftId: 'R6lCzCQE9sutEtWGkLFbp',
  status: 'pending',
  transactionId: 'hgd2U_ECqKMK_7pN-qJAv',
  created: 1646990846334,
  update: 1646990846334,
};

const successResponse = {
  data: {
    blockchainStatus: 200,
    transactionId: 'XYZ',
  },
};

module.exports = {
  payload,
  emptyPayload,
  AuthCode,
  jwtMock,
  jwtMock1,
  invalidPayload,
  nft,
  successResponse,
};
