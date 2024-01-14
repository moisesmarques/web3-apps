const payload = {
  title: 'Test 4 from Ashas without token',
  description: '',
  filePath:
    'https://www.eathappyproject.com/wp-content/uploads/2020/08/home-decor.jpg',
  tags: ['nft', 'eathappyproject', 'Ashas'],
  price: '99',
  categoryId: 'XNwyaIOPKkfc1iFngXorm',
  nftId: 'R6lCzCQE9sutEtWGkLFbp',
  ownerWalletId: 'R6lCzCQE9sutEtWGkLFbq',
};
const emptyDescriptionpayload = {
  title: 'Test 4 from Ashas without token',
  description: '',
  filePath:
    'https://www.eathappyproject.com/wp-content/uploads/2020/08/home-decor.jpg',
  tags: ['nft', 'eathappyproject', 'Ashas'],
  price: 'ABC',
  categoryId: 'XNwyaIOPKkfc1iFngXorm',
  nftId: 'R6lCzCQE9sutEtWGkLFbp',
  ownerWalletId: 'R6lCzCQE9sutEtWGkLFbq',
};

const incorrectPricepayload = {
  title: 'Test 4 from Ashas without token',
  description: 'Hello',
  filePath:
    'https://www.eathappyproject.com/wp-content/uploads/2020/08/home-decor.jpg',
  tags: ['nft', 'eathappyproject', 'Ashas'],
  categoryId: 'XNwyaIOPKkfc1iFngXorm',
  nftId: 'R6lCzCQE9sutEtWGkLFbp',
  ownerWalletId: 'R6lCzCQE9sutEtWGkLFbq',
};
const correctPricepayload = {
  title: 'Test 4 from Ashas without token',
  description: 'Hello',
  price: '99',
  filePath:
    'https://www.eathappyproject.com/wp-content/uploads/2020/08/home-decor.jpg',
  categoryId: 'XNwyaIOPKkfc1iFngXorm',
  nftId: 'R6lCzCQE9sutEtWGkLFbp',
  ownerWalletId: 'R6lCzCQE9sutEtWGkLFbq',
};
const correctPricepayloadNotBelongs = {
  title: 'Test 4 from Ashas without token',
  description: 'Hello',
  price: '99',
  filePath:
    'https://www.eathappyproject.com/wp-content/uploads/2020/08/home-decor.jpg',
  categoryId: 'XNwyaIOPKkfc1iFngXorm',
  nftId: 'R6lCzCQE9sutEt',
  ownerWalletId: 'R6lCzCQE9sutEtWGkLFbq',
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
const nftId = 'R6lCzCQE9sutEtWGkLFbp';
const emptyPayload = {};
module.exports = {
  payload,
  emptyPayload,
  incorrectPricepayload,
  emptyDescriptionpayload,
  AuthCode,
  nftId,
  jwtMock,
  correctPricepayload,
  correctPricepayloadNotBelongs,
};
