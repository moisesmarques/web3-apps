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
const putNftShare = {
  shareId: 'lgRoD3FjbmC0wMfvs4foW',
  recipientWalletId: 'EipYwEU51-rigcIF2dgIu',
  createdAt: '1648525575369',
  nftId: 'qa6ppFGWzzGViLdel7g_4',
  ownerWalletId: 'S9dlO-oiJGuXCGYlJPqkA',
};

const requestItem = {
  ownerId: 'titusdemo.near',
};
const requestNotPending = {
  ownerId: 'titusWallet.near',
  status: 'accepted',
};
const requestPending = {
  ownerId: 'titusWallet.near',
  status: 'pending',
};
const responseItem = {
  ownerId: 'titusWallet.near',
  status: 'rejected',
};

module.exports = {
  jwtMock,
  requestItem,
  requestNotPending,
  responseItem,
  requestPending,
  putNftShare,
};
