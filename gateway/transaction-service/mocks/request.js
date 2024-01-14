const incorrectPayload = {
  type: 'wrong',
};

const revokeFileAccessPayload = {
  senderWalletId: 'owner.near',
  type: 'revoke_file_access',
  fileHash: '1',
};

const sendTokenPayload = {
  ownerWalletId: 'owner.near',
  receiverWalletId: 'recipient.near',
  type: 'send_token',
  notes: 'sending token',
  nearAmount: 0.123,
};

const createAccountPayload = {
  senderWalletId: 'owner.near',
  type: 'create_account',
  appId: '1',
  actionId: '2',
};

const createNftSeriesPayload = {
  senderWalletId: 'owner.near',
  type: 'nft_series_create',
  name: 'new nft series',
  capacity: 20,
  appId: 'my_app',
  actionId: 'my_hashed_action_id',
};

const grantFileAccessPayload = {
  senderWalletId: 'owner.near',
  type: 'grant_file_access',
  fileHash: '1',
};

const mintNftPayload = {
  senderWalletId: 'owner.near',
  type: 'nft_series_mint',
  seriesId: 1,
  deposit: 20,
  appId: '1',
  actionId: '2',
  media: 'https://ipfs.io/ipfs/bafybeicvjdjdxhu6oglore3dw26pclogws2adk7gtmsllje6siinqq4uzy',
  reference: 'https://ipfs.io/ipfs/bafybeicvjdjdxhu6oglore3dw26pclogws2adk7gtmsllje6siinqq4uzy',
};

const deleteFilePayload = {
  senderWalletId: 'owner.near',
  type: 'delete_file',
  fileHash: '1',
};

const createAndMintPayload = {
  senderWalletId: 'om20gi64g74.testnet',
  type: 'create_and_mint_nft',
  name: 'new nft series',
  capacity: 20,
  deposit: 10,
  appId: '1',
  actionId: '1',
  media: 'https://ipfs.io/ipfs/bafybeicvjdjdxhu6oglore3dw26pclogws2adk7gtmsllje6siinqq4uzy',
  reference: 'https://ipfs.io/ipfs/bafybeicvjdjdxhu6oglore3dw26pclogws2adk7gtmsllje6siinqq4uzy',
  title: 'My Awesome NFT',
  description: 'Is Awesome',
  mediaHash: 'A Hash',
  copies: '1',
  issuedAt: '239123123',
  expiresAt: '1231232',
  startsAt: '123123123',
  updatedAt: '123123123',
  extra: 'Extra data',
  referenceHash: 'hashed refernce',
};

const createFilePayload = {
  senderWalletId: 'owner.near',
  type: 'create_file',
  fileHash: '1',
};

const emptyPayload = {};

const jwtMock = {
  lastName: 'testlastname',
  userId: '_BE_Ou5exXqW-wFLuTxud',
  status: 'active',
  created: 1646209318710,
  isPhoneVerified: false,
  email: 'test@gmail.com',
  firstName: 'testname',
  isEmailVerified: false,
  iat: 1646327133,
  walletId: 'owner.near',
};

const AuthCode = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJsYXN0TmFtZSI6Iktpdml0ZSIsInVzZXJJZCI6Il9CRV9PdTVleFhxVy13Rkx1VHh1ZCIsInN0YXR1cyI6ImFjdGl2ZSIsImNyZWF0ZWQiOjE2NDYyMDkzMTg3MTAsImlzUGhvbmVWZXJpZmllZCI6ZmFsc2UsImVtYWlsIjoidGtpdml0ZUBnbWFpbC5jb20iLCJmaXJzdE5hbWUiOiJUaXR1cyIsImlzRW1haWxWZXJpZmllZCI6ZmFsc2UsIndhbGxldE5hbWUiOiJ0aXR1c1dhbGxldC5uZWFyIiwiaWF0IjoxNjQ2MzI3MTMzLCJleHAiOjE2NDY0MTM1MzN9.PFA57GwzBuIM8O04XICee1xFTciApptbDCGTjTWPtyU';

module.exports = {
  payloads: [
    ['createFile', createFilePayload],
    ['revokeFileAccess', revokeFileAccessPayload],
    //    ['sendToken', sendTokenPayload],
    ['createAccount', createAccountPayload],
    ['createNftSeries', createNftSeriesPayload],
    ['mintNft', mintNftPayload],
    ['deleteFile', deleteFilePayload],
    ['grantFileAccess', grantFileAccessPayload],
    ['createAndMint', createAndMintPayload],
  ],
  completePayload: createNftSeriesPayload,
  incorrectPayload,
  emptyPayload,
  jwtMock,
  AuthCode,
};
