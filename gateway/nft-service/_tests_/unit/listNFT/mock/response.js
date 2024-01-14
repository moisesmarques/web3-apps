const listNftMock = [{
  nftId: 'myNftID1',
  transactionId: '12345689',
},
{
  nftId: 'myNftID2',
},
{
  nftId: 'myNftID2',
  fileId: 'fileId',
  transactionId: '12345689',
}];

const transactionMock = {
  status: 'complete',
  transactionId: '3_G4Y59J1AuodqM5Nl97k',
  ownerId: '9_kpv5pcCxa5YLi7gfAN0',
  ownerWalletId: 'muhammadzubair.near',
  updated: 1647287919848,
};

const filesMock = {
  size: 86668,
  version: '06-04-2022',
  path: 'blob:https://react-nft-maker-v21.vercel.app/b036cc33-4f8d-479a-bed5-162c5bd26bb0',
  folderId: 'root',
  created: '2022-04-11T17:24:01.519Z',
  dataEncryptionKey: {
    encrypted: '8004d792-11b7-43f0-91a0-d69c108e98e8',
    md5: 'c57ZLNBItk4DGI2KDJhdvg==',
  },
  walletId: 'muhammadzubair4.testnet',
  name: '1.jpeg',
  ownerId: 'muhammadzubair4.testnet',
  hash: '7f9e3c64a12548cdb241cf78f60a766c9e11762320eec510ec32ef40ff0b6c044200f5cb8794e461f98ae063be8bcdcb',
  updated: '2022-04-11T17:24:06.610Z',
  storageProvider: 'S3',
  userId: 'ka3TxaVqnA1YDpAnrlQCo',
  fileId: '262cff27-0b65-44a2-a194-f98be75b9228',
  description: '{"name":"1.jpeg","type":"image/jpeg","size":86668}',
};

const response200 = [{
  nftId: 'myNftID1',
  transactionId: '12345689',
  status: 'complete',
},
{
  nftId: 'myNftID2',
}, {
  nftId: 'myNftID1',
  transactionId: '12345689',
  status: 'complete',
  fileType: 'image/jpeg',
}];

module.exports = {
  listNftMock,
  transactionMock,
  response200,
  filesMock,
};
