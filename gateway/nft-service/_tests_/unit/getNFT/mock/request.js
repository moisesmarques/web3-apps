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
const nft = {
  message: 'NFT created successfully.',
  data: {
    title: 'Test 4 from Ashas without token',
    filePath: 'https://www.eathappyproject.com/wp-content/uploads/2020/08/home-decor.jpg',
    tags: [
      'nft',
      'eathappyproject',
      'Ashas',
    ],
    categoryId: 'XNwyaIOPKkfc1iFngXorm',
    ownerWalletId: 'titusWallet.near',
    ownerId: 'DOuy50BSo93Y3fdYC6cq9',
    nftId: 'R6lCzCQE9sutEtWGkLFbp',
    status: 'pending',
    transactionId: 'F2Xiec-894vXvEqj_IIob',
    created: 1647508085470,
    updated: 1647508085470,
  },
};

const AuthCode = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJsYXN0TmFtZSI6Iktpdml0ZSIsInVzZXJJZCI6Il9CRV9PdTVleFhxVy13Rkx1VHh1ZCIsInN0YXR1cyI6ImFjdGl2ZSIsImNyZWF0ZWQiOjE2NDYyMDkzMTg3MTAsImlzUGhvbmVWZXJpZmllZCI6ZmFsc2UsImVtYWlsIjoidGtpdml0ZUBnbWFpbC5jb20iLCJmaXJzdE5hbWUiOiJUaXR1cyIsImlzRW1haWxWZXJpZmllZCI6ZmFsc2UsIndhbGxldE5hbWUiOiJ0aXR1c1dhbGxldC5uZWFyIiwiaWF0IjoxNjQ2MzI3MTMzLCJleHAiOjE2NDY0MTM1MzN9.PFA57GwzBuIM8O04XICee1xFTciApptbDCGTjTWPtyU';
const nftId = 'R6lCzCQE9sutEtWGkLFbp';
const fakeOwnerId = 'dsdsdsd';
module.exports = {
  jwtMock, AuthCode, nftId, nft, fakeOwnerId,
};
