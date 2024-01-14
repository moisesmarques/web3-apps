const payload = {
  name: 'mydemo777.png',
  path: '/myDrive/mydemo777.png',
  description: 'description',
  storageProvider: 's3',
  folderId: 'myDriveFolder',
};
const wrongPayload = {
  walletId: 'wrongwallet',
  folderId: '',
};

const wrongFileId = {
  fileId: 'dsfsagsdg-gagasg3434-gagsafa',
};

const emptyPayload = {};

const jwtMock = {
  lastName: 'abc',
  userId: 'jPGd_Wg8FfVVKsdBu5Iv2',
  status: 'active',
  created: 1649023277339,
  isPhoneVerified: false,
  email: 'rahul.ladumor@primelab.io',
  firstName: 'demora',
  isEmailVerified: false,
  walletName: 'demo777.testnet',
  iat: 1649023351,
  exp: 1649109751,
};

const AuthCode = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJsYXN0TmFtZSI6ImFiYyIsInVzZXJJZCI6ImpQR2RfV2c4RmZWVktzZEJ1NUl2MiIsInN0YXR1cyI6ImFjdGl2ZSIsImNyZWF0ZWQiOjE2NDkwMjMyNzczMzksImlzUGhvbmVWZXJpZmllZCI6ZmFsc2UsImVtYWlsIjoicmFodWwubGFkdW1vckBwcmltZWxhYi5pbyIsImZpcnN0TmFtZSI6ImRlbW9yYSIsImlzRW1haWxWZXJpZmllZCI6ZmFsc2UsIndhbGxldE5hbWUiOiJkZW1vNzc3LnRlc3RuZXQiLCJpYXQiOjE2NDkwMjMzNTEsImV4cCI6MTY0OTEwOTc1MX0.sg9QP06Alorq9KaDKb3Jz4KoVE-eZGT2tpEXzsKJ20o';

module.exports = {
  payload,
  AuthCode,
  emptyPayload,
  jwtMock,
  wrongPayload,
  wrongFileId,
};
